import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getGuestToken } from "@/lib/auth/session";
import { addMedia, getProject } from "@/lib/db/repository";
import { hasSupabase } from "@/lib/env";
import { getSignedAssetUrl, uploadAsset } from "@/lib/storage/assets";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
]);

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const projectId = String(form.get("projectId") || "");
  const file = form.get("file");
  if (!projectId || !(file instanceof File)) {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size > 100 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const guestToken = await getGuestToken();
  const user = await getCurrentUser();
  const project = await getProject(projectId, guestToken);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const storagePath = `uploads/${projectId}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (hasSupabase()) {
    await uploadAsset(storagePath, buffer, file.type);
  }

  const url = hasSupabase()
    ? (await getSignedAssetUrl(storagePath)) ?? undefined
    : file.type.startsWith("video")
      ? "/samples/covers/golden-hour.svg"
      : "/samples/covers/golden-hour.svg";

  const media = await addMedia(projectId, {
    userId: user?.id ?? null,
    kind: file.type.startsWith("video") ? "video_clip" : "portrait",
    storagePath,
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    sortOrder: project.media?.length || 0,
    consentConfirmed: true,
    url,
  });

  return NextResponse.json({ ok: true, media });
}
