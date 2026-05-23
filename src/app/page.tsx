import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { phaseRoutes } from "@/lib/constants/phases";

const foundations = [
  "Next.js 15 App Router",
  "Strict TypeScript",
  "TailwindCSS and Shadcn/UI",
  "Theme provider",
  "Vitest and Testing Library",
  "Environment documentation",
];

export default function HomePage() {
  return (
    <PageShell
      eyebrow="Phase 1 foundation"
      title="A stable architecture shell for NeuroLedger."
      description="This build establishes the production application foundation without starting authentication, blockchain, marketplace, or upload feature logic."
      className="py-20"
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Infrastructure ready for subsystem delivery</CardTitle>
            <CardDescription>
              The application shell is intentionally focused on architecture, routing,
              providers, styling, and verification tooling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {foundations.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-border/70 bg-secondary/40 p-4 text-sm font-medium"
                >
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Route boundaries</CardTitle>
            <CardDescription>
              Core routes are navigable now and reserved for their ordered future
              subsystems.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {phaseRoutes.map((route) => (
              <Button key={route.href} asChild variant="outline" className="w-full">
                <Link href={route.href} className="justify-between">
                  <span>{route.title}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-primary">
                    {route.status}
                  </span>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
