import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b1426 0%, #1a2740 100%)",
        }}
      >
        <svg width="112" height="112" viewBox="0 0 40 40">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e8d5a8" />
              <stop offset="100%" stopColor="#c9a96e" />
            </linearGradient>
          </defs>
          <ellipse cx="14" cy="29" rx="6.5" ry="5" transform="rotate(-18 14 29)" fill="url(#g)" />
          <rect x="18.4" y="6" width="3" height="24" rx="1.5" fill="url(#g)" />
          <path d="M21.4 6 C29 8 33 12.5 33 19 C33 15.5 29.5 13 21.4 12.2 Z" fill="url(#g)" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
