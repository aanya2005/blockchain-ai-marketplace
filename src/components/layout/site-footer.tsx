import { environmentVariables } from "@/lib/config/env";

export function SiteFooter() {
  const clientEnvCount = environmentVariables.filter(
    (variable) => variable.scope === "client",
  ).length;
  const serverEnvCount = environmentVariables.length - clientEnvCount;

  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="font-semibold text-foreground">NeuroLedger</p>
          <p className="mt-2 leading-6">
            Phase 1 establishes the deployable application foundation for the
            decentralized AI dataset marketplace.
          </p>
        </div>
        <div>
          <p className="font-semibold text-foreground">Architecture</p>
          <p className="mt-2 leading-6">
            Next.js App Router, strict TypeScript, TailwindCSS, Shadcn/UI, Vitest, and a
            reusable provider shell are configured.
          </p>
        </div>
        <div>
          <p className="font-semibold text-foreground">Environment scope</p>
          <p className="mt-2 leading-6">
            {clientEnvCount} public variables and {serverEnvCount} server-only variables
            are documented for later subsystems.
          </p>
        </div>
      </div>
    </footer>
  );
}
