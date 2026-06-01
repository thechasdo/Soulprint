import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { allowedUploadTypes, assertSafeFile } from "@/lib/security";

export async function POST(request: NextRequest) {
  const { fileName, mimeType, sizeBytes, profileId, tier = "free" } = await request.json();

  if (!fileName || !mimeType || !sizeBytes || !profileId) {
    return NextResponse.json({ error: "Missing upload details." }, { status: 400 });
  }

  try {
    assertSafeFile(mimeType, Number(sizeBytes), tier);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid file." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 500 });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false }
  });

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${profileId}/${crypto.randomUUID()}-${safeName}`;

  const { data, error } = await supabase.storage
    .from("memory-assets")
    .createSignedUploadUrl(path);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    bucket: "memory-assets",
    path,
    token: data.token,
    signedUrl: data.signedUrl,
    allowedUploadTypes
  });
}
