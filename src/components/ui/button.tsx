import React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "secondary";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  const variants = {
    default: "bg-slate-950 text-white hover:bg-slate-800",
    outline: "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
    ghost: "text-slate-700 hover:bg-slate-100",
    secondary: "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
