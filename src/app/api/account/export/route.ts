import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { exportUserData } from "@/lib/db/repository";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await exportUserData(user.id);
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="memories-to-melody-export-${user.id}.json"`,
    },
  });
}
