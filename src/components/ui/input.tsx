import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-navy placeholder:text-muted/80 shadow-sm focus-visible:ring-2 focus-visible:ring-gold/50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-navy placeholder:text-muted/80 shadow-sm focus-visible:ring-2 focus-visible:ring-gold/50 min-h-28",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export const Label = ({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("mb-1.5 block text-sm font-medium text-navy", className)} {...props} />
);

export const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-navy shadow-sm focus-visible:ring-2 focus-visible:ring-gold/50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";
