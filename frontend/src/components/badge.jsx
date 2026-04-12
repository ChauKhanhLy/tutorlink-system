import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center px-2 py-0.5 text-xs rounded-md",
  {
    variants: {
      variant: {
        default: "bg-blue-500 text-white",
        secondary: "bg-gray-200",
        destructive: "bg-red-500 text-white",
        outline: "border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge };