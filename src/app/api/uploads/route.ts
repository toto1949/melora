import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getGuestToken } from "@/lib/auth/session";
import { getProject } from "@/lib/db/repository";
import { logEvent } from "@/lib/observability/logger";
import { processMediaUpload } from "@/lib/uploads/process-upload";

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
  const guestToken = await getGuestToken();
  const user = await getCurrentUser();
  const project = await getProject(projectId, guestToken);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  let media;
  try {
    media = await processMediaUpload({
      projectId,
      file,
      userId: user?.id ?? null,
      sortOrder: project.media?.length || 0,
    });
  } catch (error) {
    logEvent("warn", "media_upload_rejected", {
      projectId,
      fileName: file.name,
      error: error instanceof Error ? error.message : "Unknown upload error",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload rejected" },
      { status: 422 },
    );
  }

  return NextResponse.json({ ok: true, media });
}
