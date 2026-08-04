import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-gold to-[#b8924f] text-navy shadow-[0_10px_30px_rgba(201,169,110,0.28)] hover:-translate-y-0.5",
        secondary:
          "border border-border bg-surface/80 text-navy backdrop-blur hover:bg-surface",
        ghost: "text-navy hover:bg-cream-deep/60",
        danger: "bg-rose text-white hover:opacity-90",
      },
      size: {
        sm: "px-3.5 py-2 text-xs",
        md: "px-5 py-2.5",
        lg: "px-6 py-3.5 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";
