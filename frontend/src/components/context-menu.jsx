"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { cn } from "./utils";

function ContextMenu(props) {
  return <ContextMenuPrimitive.Root {...props} />;
}

function ContextMenuTrigger(props) {
  return <ContextMenuPrimitive.Trigger {...props} />;
}

function ContextMenuContent({ className, ...props }) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        className={cn("bg-white border rounded shadow p-1", className)}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({ className, ...props }) {
  return (
    <ContextMenuPrimitive.Item
      className={cn("px-2 py-1 text-sm hover:bg-gray-100", className)}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({ children, checked, ...props }) {
  return (
    <ContextMenuPrimitive.CheckboxItem {...props} checked={checked}>
      <span className="mr-2">
        <CheckIcon className="size-4" />
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({ children, ...props }) {
  return (
    <ContextMenuPrimitive.RadioItem {...props}>
      <span className="mr-2">
        <CircleIcon className="size-3" />
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
};