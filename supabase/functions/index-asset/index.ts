import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

function chunkText(text: string, size = 1200) {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

Deno.serve(async (req) => {
  const { assetId } = await req.json();

  if (!assetId) {
    return new Response(JSON.stringify({ error: "Missing assetId" }), { status: 400 });
  }

  const { data: asset, error } = await supabase
    .from("assets")
    .select("*")
    .eq("id", assetId)
    .single();

  if (error || !asset) {
    return new Response(JSON.stringify({ error: error?.message ?? "Asset not found" }), { status: 404 });
  }

  // Placeholder extraction:
  // Production path:
  // 1. Download file from private bucket.
  // 2. If PDF/image: OCR.
  // 3. If audio/video: transcribe.
  // 4. If text: read text.
  // 5. Create vector embeddings.
  const extracted = [
    asset.title,
    asset.description,
    asset.original_filename,
    Array.isArray(asset.tags) ? asset.tags.join(" ") : ""
  ].filter(Boolean).join("\n");

  const chunks = chunkText(extracted || asset.original_filename);

  await supabase.from("asset_chunks").delete().eq("asset_id", asset.id);

  for (let i = 0; i < chunks.length; i++) {
    await supabase.from("asset_chunks").insert({
      asset_id: asset.id,
      family_id: asset.family_id,
      chunk_index: i,
      content: chunks[i]
    });
  }

  await supabase
    .from("assets")
    .update({
      status: "indexed",
      extracted_text: extracted,
      indexed_at: new Date().toISOString()
    })
    .eq("id", asset.id);

  return new Response(JSON.stringify({ indexed: true, chunks: chunks.length }), {
    headers: { "Content-Type": "application/json" }
  });
});
