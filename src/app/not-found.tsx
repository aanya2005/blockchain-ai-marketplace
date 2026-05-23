import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell
      eyebrow="404"
      title="Route not found"
      description="The requested route is not part of the current NeuroLedger application shell."
    >
      <Button asChild>
        <Link href="/">Return home</Link>
      </Button>
    </PageShell>
  );
}
