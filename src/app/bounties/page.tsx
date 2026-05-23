import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Bounties",
};

export default function BountiesPage() {
  return (
    <PageShell
      eyebrow="Route boundary"
      title="Bounty board"
      description="This route is reserved for dataset bounty workflows. Phase 1 keeps the page functional without introducing bounty state or forms."
    >
      <Card>
        <CardHeader>
          <CardTitle>Planned responsibility</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Support bounty creation, contributor submissions, review workflows, deadlines,
          and reward release once prerequisite subsystems are complete.
        </CardContent>
      </Card>
    </PageShell>
  );
}
