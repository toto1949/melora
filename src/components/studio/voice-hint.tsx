"use client";

import { useLocale } from "@/components/i18n/locale-provider";

export function VoiceHint() {
  const { messages } = useLocale();

  return (
    <p className="mt-4 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted">
      {messages.studio.story.voiceHint}
    </p>
  );
}
