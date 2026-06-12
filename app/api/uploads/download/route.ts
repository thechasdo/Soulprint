import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

type AssetRow = {
  id: string;
  family_id: string;
  profile_id: string | null;
  bucket: string;
  storage_path: string;
};

const publicVisibility = new Set(["public", "unlisted"]);

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Missing file path." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: asset, error: assetError } = await admin
    .from("assets")
    .select("id, family_id, profile_id, bucket, storage_path")
    .eq("storage_path", path)
    .maybeSingle();

  if (assetError || !asset) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  let canAccess = false;

  const typedAsset = asset as AssetRow;
  if (typedAsset.profile_id) {
    const { data: profile } = await admin
      .from("soulprint_profiles")
      .select("visibility")
      .eq("id", typedAsset.profile_id)
      .maybeSingle();

    canAccess = Boolean(profile?.visibility && publicVisibility.has(profile.visibility));
  }

  if (!canAccess) {
    const cookieStore = await cookies();
    const userClient = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value }));
        },
        setAll(cookieInstances) {
          try {
            cookieInstances.forEach((cookie) => cookieStore.set(cookie.name, cookie.value, cookie.options));
          } catch {
            // Safe to ignore in route handlers that cannot mutate cookies.
          }
        },
      },
    });

    const {
      data: { user },
    } = await userClient.auth.getUser();

    if (user) {
      const { data: membership } = await admin
        .from("family_memberships")
        .select("id")
        .eq("family_id", typedAsset.family_id)
        .eq("user_id", user.id)
        .maybeSingle();

      canAccess = Boolean(membership);
    }
  }

  if (!canAccess) {
    return NextResponse.json({ error: "You do not have permission to access this file." }, { status: 403 });
  }

  const { data, error } = await admin.storage
    .from(typedAsset.bucket)
    .createSignedUrl(typedAsset.storage_path, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Could not create a download link." }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
