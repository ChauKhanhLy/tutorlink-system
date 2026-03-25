"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "./utils";


function Calendar({ className, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      components={{
        IconLeft: (props) => <ChevronLeft {...props} />,
        IconRight: (props) => <ChevronRight {...props} />,
      }}
      {...props}
    />
  );
}

export { Calendar };