import React from "react";
import { cn } from "../../lib/utils";

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-slate-200/90 shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn("px-5 py-4 border-b border-slate-100 flex flex-col gap-1", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3
      className={cn("text-base font-semibold text-slate-900 tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p className={cn("text-xs text-slate-500", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "px-5 py-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
