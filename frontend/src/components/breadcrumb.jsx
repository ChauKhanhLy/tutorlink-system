import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "./utils";

function Breadcrumb(props) {
  return <nav aria-label="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }) {
  return (
    <ol className={cn("flex items-center gap-2 text-sm", className)} {...props} />
  );
}

function BreadcrumbItem({ className, ...props }) {
  return (
    <li className={cn("flex items-center gap-1", className)} {...props} />
  );
}

function BreadcrumbLink({ asChild, className, ...props }) {
  const Comp = asChild ? Slot : "a";
  return <Comp className={cn("hover:underline", className)} {...props} />;
}

function BreadcrumbPage({ className, ...props }) {
  return (
    <span className={cn("font-medium", className)} {...props} />
  );
}

function BreadcrumbSeparator({ children, ...props }) {
  return <li {...props}>{children ?? <ChevronRight />}</li>;
}

function BreadcrumbEllipsis(props) {
  return (
    <span {...props}>
      <MoreHorizontal />
      <span className="sr-only">Xem thêm</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};