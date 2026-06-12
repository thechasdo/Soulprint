import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { allowedUploadTypes, assertSafeFile, tierLimits } from "@/lib/security";

type Role = "owner" | "admin" | "editor" | "contributor" | "viewer" | "legacy_contact" | "executor_viewer";
type AssetType = "photo" | "voice" | "video" | "document" | "other";
type Tier = keyof typeof tierLimits;

const uploadRoles: Role[] = ["owner", "admin", "editor", "contributor"];

export async function POST(request: NextRequest) {
  const { fileName, mimeType, sizeBytes, profileId, assetType = "other" } = await request.json();

  if (!fileName || !mimeType || !sizeBytes || !profileId) {
    return NextResponse.json({ error: "Missing upload details." }, { status: 400 });
  }

  if (!["photo", "voice", "video", "document", "other"].includes(assetType)) {
    return NextResponse.json({ error: "Invalid asset type." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const cookieStore = await cookies();
  const userClient = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(cookieInstances) {
        try {
          cookieInstances.forEach((c) => cookieStore.set(c.name, c.value, c.options));
        } catch {
          // Ignore when called from a context that cannot set cookies.
        }
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "You must be signed in to upload files." }, { status: 401 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: profile, error: profileError } = await admin
    .from("soulprint_profiles")
    .select("id, family_id")
    .eq("id", profileId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const { data: membership, error: membershipError } = await admin
    .from("family_memberships")
    .select("role")
    .eq("family_id", profile.family_id)
    .eq("user_id", user.id)
    .single();

  if (membershipError || !membership || !uploadRoles.includes(membership.role as Role)) {
    return NextResponse.json({ error: "You do not have permission to upload to this family." }, { status: 403 });
  }

  const { data: subscription } = await admin
    .from("subscriptions")
    .select("tier")
    .eq("user_id", user.id)
    .maybeSingle();

  const tier = ((subscription?.tier as Tier | undefined) ?? "free") as Tier;

  try {
    assertSafeFile(mimeType, Number(sizeBytes), tier);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid file." }, { status: 400 });
  }

  const { data: existingAssets, error: usageError } = await admin
    .from("assets")
    .select("size_bytes")
    .eq("uploaded_by", user.id);

  if (usageError) {
    return NextResponse.json({ error: "Could not verify storage usage." }, { status: 500 });
  }

  const usedBytes = (existingAssets ?? []).reduce((sum, asset) => sum + Number(asset.size_bytes ?? 0), 0);
  const maxBytes = tierLimits[tier].storageGb * 1024 * 1024 * 1024;

  if (usedBytes + Number(sizeBytes) > maxBytes) {
    return NextResponse.json({ error: `This upload would exceed your ${tierLimits[tier].storageGb} GB plan limit.` }, { status: 400 });
  }

  const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${profile.family_id}/${profile.id}/${crypto.randomUUID()}-${safeName}`;

  const { data, error } = await admin.storage
    .from("memory-assets")
    .createSignedUploadUrl(path);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    bucket: "memory-assets",
    familyId: profile.family_id,
    profileId: profile.id,
    path,
    token: data.token,
    signedUrl: data.signedUrl,
    allowedUploadTypes,
    assetType: assetType as AssetType,
  });
}
