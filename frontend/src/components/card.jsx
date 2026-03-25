import * as React from "react";
import { cn } from "./utils";

function Card({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col gap-6 rounded-xl border bg-white", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div className={cn("px-6 pt-6 flex flex-col gap-2", className)} {...props} />
  );
}

function CardTitle({ className, ...props }) {
  return <h4 className={cn("font-semibold", className)} {...props} />;
}

function CardDescription({ className, ...props }) {
  return <p className={cn("text-gray-500 text-sm", className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div className={cn("px-6", className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};