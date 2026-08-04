"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/session";
import { listAllOrders, updatePackage, updateSettings } from "@/lib/db/repository";
import { processQueuedJobs, retryJob } from "@/lib/jobs/pipeline";

export async function processJobsAction() {
  await requireStaff();
  await processQueuedJobs();
  revalidatePath("/admin/jobs");
}

export async function retryJobAction(jobId: string) {
  await requireStaff();
  await retryJob(jobId);
  revalidatePath("/admin/jobs");
}

export async function updatePackageAction(packageId: string, formData: FormData) {
  await requireStaff();
  const priceCents = Number(formData.get("priceCents"));
  await updatePackage(packageId, { priceCents });
  revalidatePath("/admin/packages");
  revalidatePath("/pricing");
}

export async function updateSettingsAction(formData: FormData) {
  await requireStaff();
  await updateSettings({
    heroHeadline: String(formData.get("heroHeadline") || ""),
    heroSupporting: String(formData.get("heroSupporting") || ""),
    songsCreated: Number(formData.get("songsCreated") || 0),
    averageRating: Number(formData.get("averageRating") || 0),
    genresSupported: Number(formData.get("genresSupported") || 0),
    countriesServed: Number(formData.get("countriesServed") || 0),
  });
  revalidatePath("/admin/content");
  revalidatePath("/");
}

export async function exportOrdersCsvAction() {
  await requireStaff();
  const orders = await listAllOrders();
  const header = "orderNumber,email,status,totalCents,currency,createdAt\n";
  const rows = orders
    .map((o) =>
      [o.orderNumber, o.email, o.status, o.totalCents, o.currency, o.createdAt]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
  const { writeFile, mkdir } = await import("fs/promises");
  const path = await import("path");
  const outDir = path.join(process.cwd(), ".data");
  await mkdir(outDir, { recursive: true });
  const file = path.join(outDir, `orders-export-${Date.now()}.csv`);
  await writeFile(file, header + rows, "utf8");
  revalidatePath("/admin/orders");
}
