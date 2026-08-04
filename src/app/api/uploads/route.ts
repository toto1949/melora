import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getGuestToken } from "@/lib/auth/session";
import { addMedia, getProject } from "@/lib/db/repository";

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

  // Production: create signed upload URL to Supabase/S3 private bucket + malware scanning hook.
  const media = await addMedia(projectId, {
    userId: user?.id ?? null,
    kind: file.type.startsWith("video") ? "video_clip" : "portrait",
    storagePath: `uploads/${projectId}/${Date.now()}-${file.name}`,
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    sortOrder: project.media?.length || 0,
    consentConfirmed: true,
    url: "/samples/covers/golden-hour.svg",
  });

  return NextResponse.json({ ok: true, media });
}
