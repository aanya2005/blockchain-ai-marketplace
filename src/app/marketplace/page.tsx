import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Marketplace",
};

export default function MarketplacePage() {
  return (
    <PageShell
      eyebrow="Route boundary"
      title="Marketplace"
      description="This route is ready for the marketplace subsystem. Phase 1 keeps it limited to a stable navigable page while feature logic remains out of scope."
    >
      <Card>
        <CardHeader>
          <CardTitle>Planned responsibility</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Browse, search, filter, review, and purchase validated AI datasets after the
          database, upload, IPFS, and blockchain subsystems are complete.
        </CardContent>
      </Card>
    </PageShell>
  );
}
