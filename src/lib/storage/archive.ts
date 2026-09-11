import { getEnv } from "@/lib/env";
import { uploadAsset } from "./assets";

// Allowlist server-configured provider CDN hosts. No arbitrary URLs, credentials, or redirects.
export async function archiveProviderAsset(source: string, path: string, mimeType: string): Promise<string> {
  if (!source.startsWith("https://")) return source;
  const env = getEnv();
  const url = new URL(source);
  const ownOrigin = env.NEXT_PUBLIC_SUPABASE_URL;
  const prefix = `/storage/v1/object/sign/${env.STORAGE_BUCKET}/`;
  if (ownOrigin && url.origin === new URL(ownOrigin).origin && url.pathname.startsWith(prefix)) {
    return decodeURIComponent(url.pathname.slice(prefix.length));
  }
  const allowed = env.ASSET_DOWNLOAD_HOSTS.split(",").map(host => host.trim()).filter(Boolean);
  if (url.username || url.password || url.port || !allowed.includes(url.hostname)) throw new Error("Asset host is not approved");
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(30_000) });
  if (!response.ok || !response.body) throw new Error("Asset download failed");
  const limit = mimeType.startsWith("audio/") ? 30 * 1024 * 1024 : 10 * 1024 * 1024;
  if (Number(response.headers.get("content-length")) > limit) throw new Error("Asset exceeds storage limit");
  const chunks: Uint8Array[] = [];
  let size = 0;
  const reader = response.body.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) throw new Error("Asset exceeds storage limit");
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  if (!size) throw new Error("Empty provider asset");
  return uploadAsset(path, Buffer.concat(chunks), mimeType);
}
