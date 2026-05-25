import Link from "next/link";

import { AuthNavigation } from "@/components/auth/auth-navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { primaryNavigation } from "@/lib/constants/navigation";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="NeuroLedger home"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15 text-sm font-black text-primary shadow-lg shadow-primary/10">
            NL
          </span>
          <span className="hidden text-lg font-bold tracking-tight sm:inline">
            NeuroLedger
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {primaryNavigation.map((item) => (
            <Button key={item.href} asChild variant="ghost" size="sm">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthNavigation />
        </div>
      </div>
    </header>
  );
}
