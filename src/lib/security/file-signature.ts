const signatures: Array<{ mimeType: string; matches: (bytes: Uint8Array) => boolean }> = [
  {
    mimeType: "image/jpeg",
    matches: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  {
    mimeType: "image/png",
    matches: (bytes) =>
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47,
  },
  {
    mimeType: "image/webp",
    matches: (bytes) =>
      text(bytes, 0, 4) === "RIFF" && text(bytes, 8, 12) === "WEBP",
  },
  {
    mimeType: "video/mp4",
    matches: (bytes) => text(bytes, 4, 8) === "ftyp",
  },
  {
    mimeType: "video/quicktime",
    matches: (bytes) =>
      text(bytes, 4, 8) === "ftyp" && text(bytes, 8, 12).startsWith("qt"),
  },
];

function text(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.slice(start, end));
}

export function matchesDeclaredFileType(bytes: Uint8Array, mimeType: string) {
  const candidates = signatures.filter((signature) => signature.mimeType === mimeType);
  return candidates.length > 0 && candidates.some((signature) => signature.matches(bytes));
}
