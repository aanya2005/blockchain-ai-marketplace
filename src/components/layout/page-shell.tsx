import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
};

export function PageShell({
  eyebrow,
  title,
  description,
  children,
  className,
}: PageShellProps) {
  return (
    <section
      className={cn("mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8", className)}
    >
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">{description}</p>
      </div>
      {children ? <div className="mt-10">{children}</div> : null}
    </section>
  );
}
