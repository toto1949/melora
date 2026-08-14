import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";

export const metadata: Metadata = { title: "Refund Policy", alternates: { canonical: "/legal/refunds" } };

export default function RefundsPage() {
  return <LegalDocument document="refunds" />;
}
