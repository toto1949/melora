import { describe, expect, it } from "vitest";
import { emailTemplates } from "@/lib/email/templates";

describe("recipient gift email", () => {
  it("contains the private reveal link and escapes recipient-provided content", () => {
    const rendered = emailTemplates["recipient-gift-ready"]({
      recipientName: "<Avery>",
      fromName: "Jordan",
      title: "Us & Always",
      personalMessage: "<script>alert('x')</script>",
      listenUrl: "https://memoriestomelody.com/listen/private-token",
    });

    expect(rendered.subject).toContain("Jordan");
    expect(rendered.html).toContain("https://memoriestomelody.com/listen/private-token");
    expect(rendered.html).toContain("&lt;Avery&gt;");
    expect(rendered.html).not.toContain("<script>");
  });
});
