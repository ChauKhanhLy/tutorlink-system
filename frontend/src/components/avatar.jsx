"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "./utils";

function Avatar({ className, ...props }) {
  return (
    <AvatarPrimitive.Root
      className={cn("size-10 rounded-full overflow-hidden", className)}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }) {
  return (
    <AvatarPrimitive.Image
      className={cn("size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }) {
  return (
    <AvatarPrimitive.Fallback
      className={cn("flex items-center justify-center bg-gray-200", className)}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };