import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthFormShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthFormShell({
  eyebrow,
  title,
  description,
  children,
}: AuthFormShellProps) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-12rem)] w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
          {description}
        </p>
        <div className="mt-8 grid gap-3 text-sm text-muted-foreground">
          <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
            Supabase Auth manages secure sessions, password recovery, and refresh-token
            persistence.
          </div>
          <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
            Role and wallet-link structures are prepared without exposing service role
            credentials to the browser.
          </div>
        </div>
      </div>

      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
}
