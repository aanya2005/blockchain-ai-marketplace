import type * as React from "react";

import { cn } from "@/lib/utils";

type AlertVariant = "default" | "success" | "destructive";

const variantClasses: Record<AlertVariant, string> = {
  default: "border-border bg-secondary/40 text-muted-foreground",
  success: "border-primary/40 bg-primary/10 text-primary",
  destructive: "border-destructive/40 bg-destructive/10 text-destructive",
};

type AlertProps = React.ComponentProps<"div"> & {
  variant?: AlertVariant;
};

function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div
      role="status"
      data-slot="alert"
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm leading-6",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Alert };
