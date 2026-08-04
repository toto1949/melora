"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion({
  items,
}: {
  items: Array<{ id: string; question: string; answer: string }>;
}) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  const baseId = useId();

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const panelId = `${baseId}-${item.id}-panel`;
        const buttonId = `${baseId}-${item.id}-button`;
        return (
          <div key={item.id} className="surface-card overflow-hidden">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                <span className="font-display text-lg text-navy">{item.question}</span>
                <ChevronDown
                  className={cn("h-5 w-5 shrink-0 text-muted transition", isOpen && "rotate-180")}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="px-5 pb-5 prose-muted text-sm"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
