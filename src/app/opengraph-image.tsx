import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/constants";

export const runtime = "edge";
export const alt = `${BRAND.name} — Personalized songs from your memories`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0b1426 0%, #1a2740 55%, #2a3a5c 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "rgba(201, 169, 110, 0.22)",
            filter: "blur(20px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            left: -80,
            width: 380,
            height: 380,
            borderRadius: 999,
            background: "rgba(196, 132, 138, 0.2)",
            filter: "blur(20px)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#c9a96e",
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          ♪ Personalized songs
        </div>
        <div
          style={{
            marginTop: 28,
            color: "#f7f0e6",
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 980,
          }}
        >
          {BRAND.name}
        </div>
        <div
          style={{
            marginTop: 26,
            color: "rgba(247, 240, 230, 0.78)",
            fontSize: 36,
            lineHeight: 1.35,
            maxWidth: 900,
          }}
        >
          {BRAND.tagline}
        </div>
        <div
          style={{
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#0b1426",
            background: "linear-gradient(135deg, #c9a96e 0%, #b8924f 100%)",
            borderRadius: 999,
            padding: "18px 36px",
            fontSize: 28,
            fontWeight: 700,
            alignSelf: "flex-start",
          }}
        >
          memoriestomelody.com
        </div>
      </div>
    ),
    { ...size }
  );
}
