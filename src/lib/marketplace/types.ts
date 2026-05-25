import type { Row } from "@/lib/supabase/database.types";

export type MarketplaceSort = "newest" | "highest_rated" | "price" | "popularity";

export type MarketplaceFilters = {
  search: string;
  category: string;
  tag: string;
  sort: MarketplaceSort;
  page: number;
  pageSize: number;
};

export type MarketplaceDataset = Pick<
  Row<"datasets">,
  | "id"
  | "uploader_id"
  | "title"
  | "description"
  | "tags"
  | "category"
  | "file_name"
  | "file_size_bytes"
  | "file_mime_type"
  | "validation_score"
  | "cid"
  | "blockchain_hash"
  | "registry_transaction_hash"
  | "registered_on_chain_at"
  | "price"
  | "currency"
  | "visibility_status"
  | "moderation_status"
  | "created_at"
  | "updated_at"
> & {
  uploader: Pick<Row<"users">, "id" | "display_name" | "email" | "avatar_url"> | null;
  reputation: Pick<
    Row<"reputation_scores">,
    "score" | "completed_uploads" | "completed_sales" | "average_rating"
  > | null;
  reviewCount: number;
  purchaseCount: number;
};

export type DatasetTransaction = Pick<
  Row<"transactions">,
  | "id"
  | "transaction_type"
  | "status"
  | "chain_id"
  | "tx_hash"
  | "amount"
  | "currency"
  | "created_at"
>;

export type DatasetDetail = MarketplaceDataset & {
  preview: string;
  ownership: Row<"dataset_ownerships"> | null;
  transactions: DatasetTransaction[];
  related: MarketplaceDataset[];
};

export type MarketplaceSearchResult = {
  datasets: MarketplaceDataset[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  categories: string[];
};

export type PurchaseState = {
  isAuthenticated: boolean;
  hasPurchased: boolean;
  isOwner: boolean;
  hasWalletLinked: boolean;
  purchase: Row<"purchases"> | null;
  escrow: Row<"escrow_states"> | null;
};

export type DashboardSummary = {
  uploadedDatasets: MarketplaceDataset[];
  purchasedDatasets: MarketplaceDataset[];
  ownedDatasets: MarketplaceDataset[];
  transactions: Row<"transactions">[];
  walletLinks: Row<"wallet_links">[];
  reputation: Row<"reputation_scores"> | null;
  earnings: {
    totalSales: number;
    completedSales: number;
    pendingEscrows: number;
  };
};
