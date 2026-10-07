import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "font-display inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-charcoal text-cream hover:bg-sand hover:text-charcoal",
        sand: "bg-sand text-charcoal hover:bg-sand-dark",
        secondary: "bg-[#e9e4d8] text-charcoal hover:bg-[#dcd4c2]",
        outline: "border border-charcoal bg-transparent text-charcoal hover:bg-charcoal hover:text-cream",
        ghost: "hover:bg-black/5 text-neutral-600",
        destructive: "bg-red-700 text-cream hover:bg-red-600",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
        iconSm: "h-8 w-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
