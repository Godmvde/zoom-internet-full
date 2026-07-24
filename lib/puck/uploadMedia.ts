import { getBrowserSupabase } from "@/lib/supabase-browser";

// Uploads an image File to the shared `site-media` bucket and returns its public
// URL. Shared by the panel ImageField and the on-canvas "Change photo" badge so
// both use exactly one upload path. Throws on any failure (caller surfaces it).
export async function uploadSiteMedia(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  const sb = getBrowserSupabase();
  const ext = file.name.split(".").pop() || "png";
  const path = `puck/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage
    .from("site-media")
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return sb.storage.from("site-media").getPublicUrl(path).data.publicUrl;
}
