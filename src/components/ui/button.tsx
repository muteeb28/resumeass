import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  /* Radius is pill app-wide per Design System ("every button... uses pill
     radius") — safe as a base default since every amber/referrals call
     site already passes its own explicit rounded-xl/rounded-lg override
     via className, which wins over this. */
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--jf-radius-pill)] text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        /* Amber CTA reversed — fully unified on sapphire, no exceptions.
           Same color as `default` (--primary / --primary-foreground) since
           the JobFlix Design System has one brand color; kept as a distinct
           variant (not merged into `default`) for the shadow-sm weight —
           `default` is used for small scattered toggles (template select,
           photo upload), `primary` for page-level emphasized CTAs.
           ADL v1.0 motion rule: only background-color/border-color ever
           transition — no active:scale, no transform. Static shadow-sm is
           fine (shadows may exist, they just may never animate). */
        primary:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors",
      },
      size: {
        /* ADL v1.0: buttons are 16px (lg/default) / 14px (sm), weight 500 —
           overrides the base string's text-sm via twMerge (later wins). */
        default: "h-11 md:h-9 py-[var(--jf-space-btn-lg-y)] px-[var(--jf-space-btn-lg-x)] has-[>svg]:px-3 text-base",
        sm: "h-10 md:h-8 gap-1.5 py-[var(--jf-space-btn-sm-y)] px-[var(--jf-space-btn-sm-x)] has-[>svg]:px-2.5 text-sm",
        lg: "h-11 md:h-10 py-[var(--jf-space-btn-lg-y)] px-[var(--jf-space-btn-lg-x)] has-[>svg]:px-4 text-base",
        icon: "size-11 md:size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
