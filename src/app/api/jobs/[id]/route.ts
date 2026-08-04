import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/db/store";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const store = await getStore();
  const job = store.jobs.find((j) => j.id === id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}
