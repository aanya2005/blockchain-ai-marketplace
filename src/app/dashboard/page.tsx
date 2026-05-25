import { redirect } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAuthIdentity } from "@/lib/auth/roles";
import {
  createIdentityFromDatabaseUser,
  getCurrentDatabaseUser,
} from "@/lib/db/current-user";
import { getServerAuthUser } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getServerAuthUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/dashboard");
  }

  const databaseUser = await getCurrentDatabaseUser();
  const identity = databaseUser
    ? createIdentityFromDatabaseUser(databaseUser)
    : createAuthIdentity(user);

  return (
    <PageShell
      eyebrow="Protected workspace"
      title={`Welcome, ${identity.displayName}`}
      description="Your Supabase Auth session is active and this dashboard is protected by middleware and server-side user verification."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Email:</span>{" "}
              {identity.email}
            </p>
            <p>
              <span className="font-semibold text-foreground">Role:</span> {identity.role}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session persistence</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Supabase refresh-token cookies keep this route available across browser
            refreshes until the user signs out or the session expires.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet links</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Wallet-link data structures are ready for the blockchain phase. No wallet
            transaction or linking flow is active in this phase.
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
