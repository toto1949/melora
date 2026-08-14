"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

interface OccasionOption {
  slug: string;
  name: string;
  description: string;
}

const AUTO_ADVANCE_DELAY_MS = 450;

export function OccasionPicker({
  occasions,
  defaultValue,
  action,
}: {
  occasions: OccasionOption[];
  defaultValue?: string | null;
  action: (formData: FormData) => void;
}) {
  const { messages } = useLocale();
  const copy = messages.studio.occasion;
  const formRef = useRef<HTMLFormElement>(null);
  const [selected, setSelected] = useState<string | null>(defaultValue ?? null);
  const [submitting, setSubmitting] = useState(false);

  const choose = (slug: string) => {
    if (submitting) return;
    setSelected(slug);
    setSubmitting(true);
    // Let the selection animation land before advancing.
    setTimeout(() => formRef.current?.requestSubmit(), AUTO_ADVANCE_DELAY_MS);
  };

  return (
    <form ref={formRef} action={action} className="mt-8">
      <input type="hidden" name="occasion" value={selected ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2">
        {occasions.map((occasion, index) => {
          const isSelected = selected === occasion.slug;
          return (
            <motion.button
              key={occasion.slug}
              type="button"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.35, ease: "easeOut" }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => choose(occasion.slug)}
              disabled={submitting}
              aria-pressed={isSelected}
              className={cn(
                "surface-card relative p-5 text-left transition-shadow",
                isSelected
                  ? "ring-2 ring-gold shadow-[var(--shadow-lift)]"
                  : "hover:shadow-[var(--shadow-lift)]",
                submitting && !isSelected ? "opacity-50" : "",
              )}
            >
              <motion.span
                initial={false}
                animate={isSelected ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className="absolute end-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-gold-fill text-navy"
              >
                <Check className="h-4 w-4" strokeWidth={3} />
              </motion.span>
              <span className={cn("block font-display text-2xl", isSelected ? "text-rose" : "text-navy")}>
                {occasion.name}
              </span>
              <span className="mt-2 block text-sm prose-muted">{occasion.description}</span>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-6 flex min-h-11 items-center justify-between gap-4">
        <p className="text-sm text-muted" aria-live="polite">
          {submitting ? copy.saving : selected ? copy.selected : copy.prompt}
        </p>
        <button
          type="submit"
          disabled={!selected || submitting}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? messages.common.saving : messages.common.continue}
        </button>
      </div>
    </form>
  );
}
