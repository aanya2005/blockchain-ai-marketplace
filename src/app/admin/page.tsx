import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return (
    <PageShell
      eyebrow="Route boundary"
      title="Admin panel"
      description="This route is reserved for moderation and operational controls. Phase 1 does not introduce roles, privileged data, or admin actions."
    >
      <Card>
        <CardHeader>
          <CardTitle>Planned responsibility</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Manage reports, dataset moderation, user enforcement, audit logs, and platform
          integrity after authentication and RLS-backed authorization exist.
        </CardContent>
      </Card>
    </PageShell>
  );
}
