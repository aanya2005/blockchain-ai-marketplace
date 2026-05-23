import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <PageShell
      eyebrow="Route boundary"
      title="Dashboard"
      description="This route is ready for the authenticated user workspace. Authentication and account data are intentionally not implemented in Phase 1."
    >
      <Card>
        <CardHeader>
          <CardTitle>Planned responsibility</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Present owned datasets, purchases, earnings, reputation, notifications, and
          wallet activity after identity and database foundations are complete.
        </CardContent>
      </Card>
    </PageShell>
  );
}
