import { redirect } from "next/navigation";

import { WalletConnectionPanel } from "@/components/blockchain/wallet-connection-panel";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { PageShell } from "@/components/layout/page-shell";
import { DatasetCard } from "@/components/marketplace/dataset-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAuthIdentity } from "@/lib/auth/roles";
import {
  createIdentityFromDatabaseUser,
  getCurrentDatabaseUser,
} from "@/lib/db/current-user";
import {
  formatCompactNumber,
  formatDatasetPrice,
  formatDate,
} from "@/lib/marketplace/format";
import { getDashboardSummary } from "@/lib/marketplace/queries";
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
  const summary = await getDashboardSummary();

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
            Wallet linking, Base Sepolia ownership registration, and escrow transaction
            persistence are available below.
          </CardContent>
        </Card>
      </div>
      <WalletConnectionPanel />
      <div className="mt-8 grid gap-6 lg:grid-cols-4">
        <Metric title="Uploaded" value={summary.uploadedDatasets.length} />
        <Metric title="Purchased" value={summary.purchasedDatasets.length} />
        <Metric title="Owned on-chain" value={summary.ownedDatasets.length} />
        <Metric title="Reputation" value={summary.reputation?.score?.toFixed(0) ?? "0"} />
      </div>

      <div className="mt-8 grid gap-8">
        <DashboardSection
          title="Uploaded datasets"
          description="Datasets you uploaded through the secure IPFS pipeline."
        >
          <DatasetStrip datasets={summary.uploadedDatasets} empty="No uploads yet." />
        </DashboardSection>

        <DashboardSection
          title="Purchased datasets"
          description="Datasets you purchased or escrowed through blockchain flows."
        >
          <DatasetStrip datasets={summary.purchasedDatasets} empty="No purchases yet." />
        </DashboardSection>

        <DashboardSection
          title="Owned datasets"
          description="Datasets with ownership records registered on Base Sepolia."
        >
          <DatasetStrip
            datasets={summary.ownedDatasets}
            empty="No on-chain ownership records yet."
          />
        </DashboardSection>

        <div className="grid gap-8 xl:grid-cols-2">
          <DashboardSection
            title="Earnings overview"
            description="Sales and escrow indicators for your contributor activity."
          >
            <div className="grid gap-3 text-sm text-muted-foreground">
              <Row
                label="Total sales"
                value={formatCompactNumber(summary.earnings.totalSales)}
              />
              <Row
                label="Completed sales"
                value={formatCompactNumber(summary.earnings.completedSales)}
              />
              <Row
                label="Pending escrows"
                value={formatCompactNumber(summary.earnings.pendingEscrows)}
              />
              <Row
                label="Average rating"
                value={summary.reputation?.average_rating?.toFixed(1) ?? "New"}
              />
            </div>
          </DashboardSection>

          <DashboardSection
            title="Wallet status"
            description="Wallets linked to your authenticated account."
          >
            {summary.walletLinks.length > 0 ? (
              <div className="space-y-3">
                {summary.walletLinks.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="rounded-2xl border border-border bg-secondary/30 p-4 text-sm"
                  >
                    <p className="break-all font-semibold">{wallet.wallet_address}</p>
                    <p className="mt-1 text-muted-foreground">
                      Chain {wallet.chain_id} · {wallet.is_primary ? "Primary" : "Linked"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Connect and link a wallet above to enable on-chain registration and
                purchases.
              </p>
            )}
          </DashboardSection>
        </div>

        <DashboardSection
          title="Blockchain transaction history"
          description="Recent ownership, escrow, and purchase-related transactions."
        >
          {summary.transactions.length > 0 ? (
            <div className="space-y-3">
              {summary.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="rounded-2xl border border-border bg-secondary/30 p-4 text-sm"
                >
                  <div className="flex flex-wrap justify-between gap-3">
                    <span className="font-semibold">
                      {transaction.transaction_type.replace("_", " ")}
                    </span>
                    <span className="text-muted-foreground">
                      {formatDate(transaction.created_at)}
                    </span>
                  </div>
                  <p className="mt-2 break-all text-muted-foreground">
                    {transaction.tx_hash ?? "Transaction hash pending"} ·{" "}
                    {transaction.amount
                      ? formatDatasetPrice(transaction.amount, transaction.currency)
                      : transaction.status}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              On-chain registration and escrow transactions will appear here.
            </p>
          )}
        </DashboardSection>
      </div>
    </PageShell>
  );
}

function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-3xl font-black text-primary">{value}</p>
      </CardContent>
    </Card>
  );
}

function DatasetStrip({
  datasets,
  empty,
}: {
  datasets: Awaited<ReturnType<typeof getDashboardSummary>>["uploadedDatasets"];
  empty: string;
}) {
  if (datasets.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {datasets.slice(0, 3).map((dataset) => (
        <DatasetCard key={dataset.id} dataset={dataset} />
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
