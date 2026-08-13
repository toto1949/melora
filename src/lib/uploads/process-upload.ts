import { nanoid } from "nanoid";
import { addMedia } from "@/lib/db/repository";
import { getEnv, hasSupabase } from "@/lib/env";
import { getSignedAssetUrl, uploadAsset } from "@/lib/storage/assets";
import { matchesDeclaredFileType } from "@/lib/security/file-signature";
import { scanUpload } from "@/lib/security/malware-scanner";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/quicktime"]);

export async function processMediaUpload(input: {
  projectId: string;
  file: File;
  userId: string | null;
  sortOrder: number;
}) {
  const { projectId, file, userId, sortOrder } = input;
  const env = getEnv();
  const isVideo = VIDEO_TYPES.has(file.type);
  if (!IMAGE_TYPES.has(file.type) && !isVideo) throw new Error("Unsupported file type");
  if (isVideo && !env.VIDEO_FEATURE_ENABLED) {
    throw new Error("Video uploads will be available in the next release");
  }
  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) throw new Error("File is larger than 10 MB");

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!matchesDeclaredFileType(buffer, file.type)) {
    throw new Error("File contents do not match its declared type");
  }
  const malwareScanStatus = await scanUpload(file);
  if (malwareScanStatus === "infected") throw new Error("Unsafe file rejected");
  if (malwareScanStatus !== "clean") throw new Error("File scan unavailable");

  const safeName = file.name.replace(/[^\w.-]+/g, "_").slice(-100);
  const storagePath = `uploads/${projectId}/${nanoid(12)}-${safeName}`;
  if (hasSupabase()) await uploadAsset(storagePath, buffer, file.type);
  const url = hasSupabase()
    ? (await getSignedAssetUrl(storagePath)) ?? undefined
    : "/samples/covers/golden-hour.svg";

  return addMedia(projectId, {
    userId,
    kind: isVideo ? "video_clip" : "portrait",
    storagePath,
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    sortOrder,
    consentConfirmed: true,
    malwareScanStatus,
    url,
  });
}
