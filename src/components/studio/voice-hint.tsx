"use client";

import { useEffect, useState } from "react";

export function VoiceHint() {
  const [message, setMessage] = useState(
    "Tip: On mobile, use your keyboard’s microphone for voice-to-text while answering these prompts.",
  );

  useEffect(() => {
    const supported =
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    if (supported) {
      setMessage(
        "Tip: On supported browsers you can use your device’s voice-to-text keyboard to speak answers into these fields.",
      );
    }
  }, []);

  return (
    <p className="mt-4 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted">
      {message}
    </p>
  );
}
