"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";
import { cn } from "./utils";

function Command({ className, ...props }) {
  return (
    <CommandPrimitive
      className={cn("flex flex-col w-full rounded-md bg-white", className)}
      {...props}
    />
  );
}

function CommandInput({ className, ...props }) {
  return (
    <div className="flex items-center border-b px-3">
      <SearchIcon className="size-4 opacity-50" />
      <CommandPrimitive.Input
        className={cn("w-full outline-none p-2", className)}
        placeholder="Tìm kiếm..."
        {...props}
      />
    </div>
  );
}

function CommandList(props) {
  return <CommandPrimitive.List className="max-h-60 overflow-auto" {...props} />;
}

function CommandEmpty() {
  return <div className="p-4 text-sm text-center">Không có kết quả</div>;
}

export { Command, CommandInput, CommandList, CommandEmpty };