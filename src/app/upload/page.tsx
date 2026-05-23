import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Upload",
};

export default function UploadPage() {
  return (
    <PageShell
      eyebrow="Route boundary"
      title="Dataset upload"
      description="This route is reserved for the secure upload subsystem. Phase 1 establishes navigation and layout without accepting files yet."
    >
      <Card>
        <CardHeader>
          <CardTitle>Planned responsibility</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Validate metadata, encrypt datasets, manage upload progress, and hand encrypted
          assets to IPFS storage in later phases.
        </CardContent>
      </Card>
    </PageShell>
  );
}
