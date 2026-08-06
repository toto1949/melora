import { getEnv, hasSupabase } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/db/client";

export async function getSignedAssetUrl(
  storagePath: string | null | undefined,
  expiresIn = 3600,
): Promise<string | null> {
  if (!storagePath) return null;
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath;
  }
  if (storagePath.startsWith("/")) return storagePath;

  if (!hasSupabase()) {
    return storagePath.includes("audio") ? "/samples/audio/placeholder-tone.wav" : "/samples/covers/golden-hour.svg";
  }

  const env = getEnv();
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.storage
    .from(env.STORAGE_BUCKET)
    .createSignedUrl(storagePath, expiresIn);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function uploadAsset(
  storagePath: string,
  body: Buffer | ArrayBuffer,
  contentType: string,
): Promise<string> {
  if (!hasSupabase()) {
    return storagePath;
  }

  const env = getEnv();
  const sb = getSupabaseAdmin();
  const { error } = await sb.storage.from(env.STORAGE_BUCKET).upload(storagePath, body, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(error.message);
  return storagePath;
}

export async function removeAsset(storagePath: string): Promise<void> {
  if (!hasSupabase()) return;
  const env = getEnv();
  const sb = getSupabaseAdmin();
  await sb.storage.from(env.STORAGE_BUCKET).remove([storagePath]);
}
