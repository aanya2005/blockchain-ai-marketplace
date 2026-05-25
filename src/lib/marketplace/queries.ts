import { cache } from "react";

import { createSupabaseServerClient, getServerAuthUser } from "@/lib/supabase/server";
import type { Row } from "@/lib/supabase/database.types";
import type {
  DashboardSummary,
  DatasetDetail,
  MarketplaceDataset,
  MarketplaceFilters,
  MarketplaceSearchResult,
  PurchaseState,
} from "@/lib/marketplace/types";

type DatasetRow = Row<"datasets">;
type UserRow = Row<"users">;
type ReputationRow = Row<"reputation_scores">;
type PurchaseRow = Row<"purchases">;

const marketplaceColumns =
  "id,uploader_id,title,description,tags,category,file_name,file_size_bytes,file_mime_type,validation_score,cid,blockchain_hash,registry_transaction_hash,registered_on_chain_at,price,currency,visibility_status,moderation_status,created_at,updated_at";

export const searchMarketplaceDatasets = cache(
  async (filters: MarketplaceFilters): Promise<MarketplaceSearchResult> => {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return {
        datasets: [],
        page: filters.page,
        pageSize: filters.pageSize,
        total: 0,
        totalPages: 0,
        categories: [],
      };
    }

    let query = supabase
      .from("datasets")
      .select(marketplaceColumns, { count: "exact" })
      .eq("visibility_status", "public")
      .eq("moderation_status", "approved");

    if (filters.search) {
      const pattern = `%${filters.search}%`;
      query = query.or(
        `title.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern}`,
      );
    }

    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    if (filters.tag) {
      query = query.contains("tags", [filters.tag.toLowerCase()]);
    }

    if (filters.sort === "price") {
      query = query.order("price", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const from = (filters.page - 1) * filters.pageSize;
    const to = from + filters.pageSize - 1;
    const { data, count, error } = await query.range(from, to);

    if (error) {
      throw error;
    }

    const datasets = await hydrateDatasets((data ?? []) as DatasetRow[]);
    const sorted = sortHydratedDatasets(datasets, filters.sort);
    const categories = await getMarketplaceCategories();
    const total = count ?? sorted.length;

    return {
      datasets: sorted,
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.ceil(total / filters.pageSize),
      categories,
    };
  },
);

export const getDatasetDetail = cache(
  async (datasetId: string): Promise<DatasetDetail | null> => {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from("datasets")
      .select(marketplaceColumns)
      .eq("id", datasetId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    const [dataset] = await hydrateDatasets([data as DatasetRow]);
    const [{ data: ownership }, { data: transactions }, related] = await Promise.all([
      supabase
        .from("dataset_ownerships")
        .select("*")
        .eq("dataset_id", datasetId)
        .maybeSingle(),
      supabase
        .from("transactions")
        .select("id,transaction_type,status,chain_id,tx_hash,amount,currency,created_at")
        .eq("dataset_id", datasetId)
        .order("created_at", { ascending: false })
        .limit(12),
      getRelatedDatasets(dataset),
    ]);

    return {
      ...dataset,
      preview: createSafePreview(dataset),
      ownership: (ownership as Row<"dataset_ownerships"> | null) ?? null,
      transactions: (transactions ?? []) as DatasetDetail["transactions"],
      related,
    };
  },
);

export async function getPurchaseState(datasetId: string): Promise<PurchaseState> {
  const supabase = await createSupabaseServerClient();
  const user = await getServerAuthUser();

  if (!supabase || !user) {
    return {
      isAuthenticated: false,
      hasPurchased: false,
      isOwner: false,
      hasWalletLinked: false,
      purchase: null,
      escrow: null,
    };
  }

  const [{ data: dataset }, { data: purchase }, { data: walletLinks }] =
    await Promise.all([
      supabase
        .from("datasets")
        .select("id,uploader_id")
        .eq("id", datasetId)
        .maybeSingle(),
      supabase
        .from("purchases")
        .select("*")
        .eq("dataset_id", datasetId)
        .eq("buyer_id", user.id)
        .maybeSingle(),
      supabase.from("wallet_links").select("*").eq("user_id", user.id).limit(1),
    ]);
  const { data: escrow } = purchase
    ? await supabase
        .from("escrow_states")
        .select("*")
        .eq("purchase_id", (purchase as PurchaseRow).id)
        .maybeSingle()
    : { data: null };

  return {
    isAuthenticated: true,
    hasPurchased: Boolean(purchase),
    isOwner: dataset?.uploader_id === user.id,
    hasWalletLinked: Boolean(walletLinks?.length),
    purchase: (purchase as PurchaseRow | null) ?? null,
    escrow: (escrow as Row<"escrow_states"> | null) ?? null,
  };
}

export const getDashboardSummary = cache(async (): Promise<DashboardSummary> => {
  const supabase = await createSupabaseServerClient();
  const user = await getServerAuthUser();

  if (!supabase || !user) {
    return emptyDashboardSummary();
  }

  const [
    uploadedResult,
    purchasesResult,
    ownershipResult,
    transactionsResult,
    walletLinksResult,
    reputationResult,
  ] = await Promise.all([
    supabase
      .from("datasets")
      .select(marketplaceColumns)
      .eq("uploader_id", user.id)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("purchases")
      .select("*")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase.from("dataset_ownerships").select("*").eq("owner_id", user.id).limit(12),
    supabase
      .from("transactions")
      .select("*")
      .eq("actor_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("wallet_links")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("reputation_scores").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  const uploadedDatasets = await hydrateDatasets(
    (uploadedResult.data ?? []) as DatasetRow[],
  );
  const purchasedRows = (purchasesResult.data ?? []) as PurchaseRow[];
  const ownedRows = (ownershipResult.data ?? []) as Row<"dataset_ownerships">[];
  const [purchasedDatasets, ownedDatasets] = await Promise.all([
    hydrateDatasetsByIds(purchasedRows.map((row) => row.dataset_id)),
    hydrateDatasetsByIds(ownedRows.map((row) => row.dataset_id)),
  ]);
  const completedSales = purchasedRows.filter((row) => row.status === "completed").length;

  return {
    uploadedDatasets,
    purchasedDatasets,
    ownedDatasets,
    transactions: (transactionsResult.data ?? []) as Row<"transactions">[],
    walletLinks: (walletLinksResult.data ?? []) as Row<"wallet_links">[],
    reputation: (reputationResult.data as Row<"reputation_scores"> | null) ?? null,
    earnings: {
      totalSales: purchasedRows.length,
      completedSales,
      pendingEscrows: purchasedRows.filter((row) => row.status === "pending").length,
    },
  };
});

async function hydrateDatasets(rows: DatasetRow[]): Promise<MarketplaceDataset[]> {
  if (rows.length === 0) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return rows.map((row) => toMarketplaceDataset(row));
  }

  const uploaderIds = [...new Set(rows.map((row) => row.uploader_id))];
  const datasetIds = rows.map((row) => row.id);
  const [usersResult, reputationResult, reviewsResult, purchasesResult] =
    await Promise.all([
      supabase
        .from("users")
        .select("id,display_name,email,avatar_url")
        .in("id", uploaderIds),
      supabase
        .from("reputation_scores")
        .select("user_id,score,completed_uploads,completed_sales,average_rating")
        .in("user_id", uploaderIds),
      supabase.from("reviews").select("dataset_id").in("dataset_id", datasetIds),
      supabase
        .from("purchases")
        .select("dataset_id")
        .eq("status", "completed")
        .in("dataset_id", datasetIds),
    ]);
  const users = new Map(
    (usersResult.data ?? []).map((user) => [
      user.id,
      user as Pick<UserRow, "id" | "display_name" | "email" | "avatar_url">,
    ]),
  );
  const reputations = new Map(
    (reputationResult.data ?? []).map((rep) => [
      rep.user_id,
      rep as Pick<
        ReputationRow,
        "score" | "completed_uploads" | "completed_sales" | "average_rating"
      > & { user_id: string },
    ]),
  );
  const reviewCounts = countByDatasetId(
    (reviewsResult.data ?? []) as Array<{ dataset_id: string }>,
  );
  const purchaseCounts = countByDatasetId(
    (purchasesResult.data ?? []) as Array<{ dataset_id: string }>,
  );

  return rows.map((row) =>
    toMarketplaceDataset(row, {
      uploader: users.get(row.uploader_id) ?? null,
      reputation: reputations.get(row.uploader_id) ?? null,
      reviewCount: reviewCounts.get(row.id) ?? 0,
      purchaseCount: purchaseCounts.get(row.id) ?? 0,
    }),
  );
}

async function hydrateDatasetsByIds(datasetIds: string[]): Promise<MarketplaceDataset[]> {
  if (datasetIds.length === 0) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("datasets")
    .select(marketplaceColumns)
    .in("id", [...new Set(datasetIds)]);

  return hydrateDatasets((data ?? []) as DatasetRow[]);
}

function toMarketplaceDataset(
  row: DatasetRow,
  hydrated?: Pick<
    MarketplaceDataset,
    "uploader" | "reputation" | "reviewCount" | "purchaseCount"
  >,
): MarketplaceDataset {
  return {
    ...row,
    uploader: hydrated?.uploader ?? null,
    reputation: hydrated?.reputation ?? null,
    reviewCount: hydrated?.reviewCount ?? 0,
    purchaseCount: hydrated?.purchaseCount ?? 0,
  };
}

function sortHydratedDatasets(
  datasets: MarketplaceDataset[],
  sort: MarketplaceFilters["sort"],
) {
  if (sort === "highest_rated") {
    return [...datasets].sort(
      (a, b) => (b.reputation?.average_rating ?? 0) - (a.reputation?.average_rating ?? 0),
    );
  }
  if (sort === "popularity") {
    return [...datasets].sort((a, b) => b.purchaseCount - a.purchaseCount);
  }
  return datasets;
}

async function getMarketplaceCategories(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("datasets")
    .select("category")
    .eq("visibility_status", "public")
    .eq("moderation_status", "approved");

  return [...new Set((data ?? []).map((row) => row.category).filter(Boolean))].sort();
}

async function getRelatedDatasets(dataset: MarketplaceDataset) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("datasets")
    .select(marketplaceColumns)
    .eq("visibility_status", "public")
    .eq("moderation_status", "approved")
    .eq("category", dataset.category)
    .neq("id", dataset.id)
    .limit(3);

  return hydrateDatasets((data ?? []) as DatasetRow[]);
}

function countByDatasetId(rows: Array<{ dataset_id: string }>) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.dataset_id, (counts.get(row.dataset_id) ?? 0) + 1);
  }
  return counts;
}

function createSafePreview(dataset: MarketplaceDataset) {
  const fields = [
    `Title: ${dataset.title}`,
    `Category: ${dataset.category}`,
    `File: ${dataset.file_name}`,
    `CID: ${dataset.cid ?? "Pending"}`,
    `Tags: ${dataset.tags.join(", ") || "None"}`,
  ];

  return fields.join("\n");
}

function emptyDashboardSummary(): DashboardSummary {
  return {
    uploadedDatasets: [],
    purchasedDatasets: [],
    ownedDatasets: [],
    transactions: [],
    walletLinks: [],
    reputation: null,
    earnings: {
      totalSales: 0,
      completedSales: 0,
      pendingEscrows: 0,
    },
  };
}
