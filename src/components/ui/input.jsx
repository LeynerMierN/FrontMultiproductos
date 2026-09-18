import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm",
      "placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900",
      "disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };

export function Label({ className, ...props }) {
  return (
    <label
      className={cn("text-[13px] font-medium text-neutral-700", className)}
      {...props}
    />
  );
}
