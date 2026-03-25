import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "./utils";

const alertVariants = cva(
  "w-full rounded-lg border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        default: "bg-white text-black",
        destructive: "bg-red-100 text-red-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({ className, variant, ...props }) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }) {
  return (
    <div className={cn("font-medium", className)} {...props} />
  );
}

function AlertDescription({ className, ...props }) {
  return (
    <div className={cn("text-sm text-gray-500", className)} {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription };