import type { AppRole } from "@/lib/auth/types";

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type DatasetVisibilityStatus =
  | "draft"
  | "private"
  | "public"
  | "unlisted"
  | "archived";
export type DatasetModerationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "flagged"
  | "removed";
export type DatasetStorageProvider = "pinata_ipfs";
export type DatasetUploadStatus =
  | "pending"
  | "encrypting"
  | "uploading"
  | "stored"
  | "failed";
export type PurchaseStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";
export type TransactionType =
  | "dataset_registration"
  | "dataset_purchase"
  | "bounty_funding"
  | "bounty_payout"
  | "refund"
  | "admin_adjustment";
export type TransactionStatus =
  | "pending"
  | "submitted"
  | "confirmed"
  | "failed"
  | "cancelled";
export type BountyStatus =
  | "draft"
  | "open"
  | "in_review"
  | "awarded"
  | "cancelled"
  | "expired";
export type SubmissionStatus =
  | "submitted"
  | "under_review"
  | "accepted"
  | "rejected"
  | "withdrawn";
export type NotificationType =
  | "system"
  | "dataset"
  | "purchase"
  | "bounty"
  | "submission"
  | "moderation"
  | "security";
export type ReportTargetType = "dataset" | "review" | "bounty" | "submission" | "user";
export type ReportStatus = "open" | "investigating" | "resolved" | "dismissed";
export type AdminActionType =
  | "user_role_updated"
  | "user_banned"
  | "user_unbanned"
  | "dataset_approved"
  | "dataset_rejected"
  | "dataset_removed"
  | "report_resolved"
  | "bounty_cancelled";
export type DatasetOwnershipStatus = "pending" | "registered" | "failed";
export type EscrowStateStatus = "funded" | "released" | "refunded" | "failed";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: AppRole;
          banned_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: AppRole;
          banned_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: AppRole;
          banned_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      wallet_links: {
        Row: {
          id: string;
          user_id: string;
          wallet_address: string;
          chain_id: number;
          is_primary: boolean;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallet_address: string;
          chain_id: number;
          is_primary?: boolean;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          wallet_address?: string;
          chain_id?: number;
          is_primary?: boolean;
          verified_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      datasets: {
        Row: {
          id: string;
          uploader_id: string;
          title: string;
          description: string;
          tags: string[];
          category: string;
          file_name: string;
          file_size_bytes: number;
          file_mime_type: string;
          file_checksum_sha256: string | null;
          row_count: number | null;
          column_count: number | null;
          validation_score: number | null;
          cid: string | null;
          blockchain_hash: string | null;
          registry_chain_id: number | null;
          registry_contract_address: string | null;
          registry_dataset_id: string | null;
          registry_transaction_hash: string | null;
          registered_on_chain_at: string | null;
          storage_provider: DatasetStorageProvider | null;
          upload_status: DatasetUploadStatus;
          storage_metadata: Json;
          encryption_metadata: Json;
          encrypted_file_size_bytes: number | null;
          encrypted_checksum_sha256: string | null;
          pinned_at: string | null;
          price: number;
          currency: string;
          visibility_status: DatasetVisibilityStatus;
          moderation_status: DatasetModerationStatus;
          rejection_reason: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          uploader_id: string;
          title: string;
          description: string;
          tags?: string[];
          category: string;
          file_name: string;
          file_size_bytes: number;
          file_mime_type: string;
          file_checksum_sha256?: string | null;
          row_count?: number | null;
          column_count?: number | null;
          validation_score?: number | null;
          cid?: string | null;
          blockchain_hash?: string | null;
          registry_chain_id?: number | null;
          registry_contract_address?: string | null;
          registry_dataset_id?: string | null;
          registry_transaction_hash?: string | null;
          registered_on_chain_at?: string | null;
          storage_provider?: DatasetStorageProvider | null;
          upload_status?: DatasetUploadStatus;
          storage_metadata?: Json;
          encryption_metadata?: Json;
          encrypted_file_size_bytes?: number | null;
          encrypted_checksum_sha256?: string | null;
          pinned_at?: string | null;
          price?: number;
          currency?: string;
          visibility_status?: DatasetVisibilityStatus;
          moderation_status?: DatasetModerationStatus;
          rejection_reason?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          uploader_id?: string;
          title?: string;
          description?: string;
          tags?: string[];
          category?: string;
          file_name?: string;
          file_size_bytes?: number;
          file_mime_type?: string;
          file_checksum_sha256?: string | null;
          row_count?: number | null;
          column_count?: number | null;
          validation_score?: number | null;
          cid?: string | null;
          blockchain_hash?: string | null;
          registry_chain_id?: number | null;
          registry_contract_address?: string | null;
          registry_dataset_id?: string | null;
          registry_transaction_hash?: string | null;
          registered_on_chain_at?: string | null;
          storage_provider?: DatasetStorageProvider | null;
          upload_status?: DatasetUploadStatus;
          storage_metadata?: Json;
          encryption_metadata?: Json;
          encrypted_file_size_bytes?: number | null;
          encrypted_checksum_sha256?: string | null;
          pinned_at?: string | null;
          price?: number;
          currency?: string;
          visibility_status?: DatasetVisibilityStatus;
          moderation_status?: DatasetModerationStatus;
          rejection_reason?: string | null;
          published_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchases: {
        Row: {
          id: string;
          buyer_id: string;
          dataset_id: string;
          transaction_id: string | null;
          status: PurchaseStatus;
          purchased_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          dataset_id: string;
          transaction_id?: string | null;
          status?: PurchaseStatus;
          purchased_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          transaction_id?: string | null;
          status?: PurchaseStatus;
          purchased_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          actor_id: string | null;
          dataset_id: string | null;
          bounty_id: string | null;
          transaction_type: TransactionType;
          status: TransactionStatus;
          chain_id: number | null;
          tx_hash: string | null;
          from_wallet_address: string | null;
          to_wallet_address: string | null;
          contract_address: string | null;
          related_purchase_id: string | null;
          amount: number | null;
          currency: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          dataset_id?: string | null;
          bounty_id?: string | null;
          transaction_type: TransactionType;
          status?: TransactionStatus;
          chain_id?: number | null;
          tx_hash?: string | null;
          from_wallet_address?: string | null;
          to_wallet_address?: string | null;
          contract_address?: string | null;
          related_purchase_id?: string | null;
          amount?: number | null;
          currency?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          actor_id?: string | null;
          dataset_id?: string | null;
          bounty_id?: string | null;
          transaction_type?: TransactionType;
          status?: TransactionStatus;
          chain_id?: number | null;
          tx_hash?: string | null;
          from_wallet_address?: string | null;
          to_wallet_address?: string | null;
          contract_address?: string | null;
          related_purchase_id?: string | null;
          amount?: number | null;
          currency?: string;
          metadata?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      bounties: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string;
          tags: string[];
          category: string;
          budget: number;
          currency: string;
          deadline: string;
          status: BountyStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          description: string;
          tags?: string[];
          category: string;
          budget: number;
          currency?: string;
          deadline: string;
          status?: BountyStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          tags?: string[];
          category?: string;
          budget?: number;
          currency?: string;
          deadline?: string;
          status?: BountyStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      submissions: {
        Row: {
          id: string;
          bounty_id: string;
          dataset_id: string;
          contributor_id: string;
          status: SubmissionStatus;
          note: string | null;
          reward_transaction_id: string | null;
          submitted_at: string;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bounty_id: string;
          dataset_id: string;
          contributor_id: string;
          status?: SubmissionStatus;
          note?: string | null;
          reward_transaction_id?: string | null;
          submitted_at?: string;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: SubmissionStatus;
          note?: string | null;
          reward_transaction_id?: string | null;
          reviewed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          dataset_id: string;
          reviewer_id: string;
          purchase_id: string | null;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dataset_id: string;
          reviewer_id: string;
          purchase_id?: string | null;
          rating: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          purchase_id?: string | null;
          rating?: number;
          comment?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string;
          is_read: boolean;
          action_url: string | null;
          metadata: Json;
          read_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: NotificationType;
          title: string;
          body: string;
          is_read?: boolean;
          action_url?: string | null;
          metadata?: Json;
          read_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: NotificationType;
          title?: string;
          body?: string;
          is_read?: boolean;
          action_url?: string | null;
          metadata?: Json;
          read_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reputation_scores: {
        Row: {
          user_id: string;
          score: number;
          completed_uploads: number;
          completed_sales: number;
          average_rating: number | null;
          bounty_acceptances: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          score?: number;
          completed_uploads?: number;
          completed_sales?: number;
          average_rating?: number | null;
          bounty_acceptances?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          score?: number;
          completed_uploads?: number;
          completed_sales?: number;
          average_rating?: number | null;
          bounty_acceptances?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string | null;
          target_type: ReportTargetType;
          target_id: string;
          reason: string;
          details: string | null;
          status: ReportStatus;
          assigned_to: string | null;
          resolution: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id?: string | null;
          target_type: ReportTargetType;
          target_id: string;
          reason: string;
          details?: string | null;
          status?: ReportStatus;
          assigned_to?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: ReportStatus;
          assigned_to?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_actions: {
        Row: {
          id: string;
          admin_id: string;
          action_type: AdminActionType;
          target_type: ReportTargetType | null;
          target_id: string | null;
          reason: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action_type: AdminActionType;
          target_type?: ReportTargetType | null;
          target_id?: string | null;
          reason?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      dataset_ownerships: {
        Row: {
          id: string;
          dataset_id: string;
          owner_id: string;
          wallet_address: string;
          chain_id: number;
          registry_contract_address: string;
          registry_dataset_id: string;
          dataset_hash: string;
          cid: string;
          transaction_hash: string;
          status: DatasetOwnershipStatus;
          registered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dataset_id: string;
          owner_id: string;
          wallet_address: string;
          chain_id: number;
          registry_contract_address: string;
          registry_dataset_id: string;
          dataset_hash: string;
          cid: string;
          transaction_hash: string;
          status?: DatasetOwnershipStatus;
          registered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: DatasetOwnershipStatus;
          registered_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      escrow_states: {
        Row: {
          id: string;
          purchase_id: string | null;
          dataset_id: string;
          buyer_id: string;
          seller_id: string;
          buyer_wallet_address: string;
          seller_wallet_address: string;
          chain_id: number;
          escrow_contract_address: string;
          escrow_purchase_id: string;
          fund_transaction_hash: string;
          release_transaction_hash: string | null;
          amount_wei: string;
          status: EscrowStateStatus;
          funded_at: string;
          released_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          purchase_id?: string | null;
          dataset_id: string;
          buyer_id: string;
          seller_id: string;
          buyer_wallet_address: string;
          seller_wallet_address: string;
          chain_id: number;
          escrow_contract_address: string;
          escrow_purchase_id: string;
          fund_transaction_hash: string;
          release_transaction_hash?: string | null;
          amount_wei: string;
          status?: EscrowStateStatus;
          funded_at?: string;
          released_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          release_transaction_hash?: string | null;
          status?: EscrowStateStatus;
          released_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      blockchain_events: {
        Row: {
          id: string;
          chain_id: number;
          contract_address: string;
          event_name: string;
          transaction_hash: string;
          log_index: number;
          block_number: number;
          payload: Json;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          chain_id: number;
          contract_address: string;
          event_name: string;
          transaction_hash: string;
          log_index: number;
          block_number: number;
          payload?: Json;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          processed_at?: string | null;
          payload?: Json;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_app_role: {
        Args: Record<string, never>;
        Returns: AppRole;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_moderator: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_admin_or_moderator: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
      dataset_visibility_status: DatasetVisibilityStatus;
      dataset_moderation_status: DatasetModerationStatus;
      dataset_storage_provider: DatasetStorageProvider;
      dataset_upload_status: DatasetUploadStatus;
      purchase_status: PurchaseStatus;
      transaction_type: TransactionType;
      transaction_status: TransactionStatus;
      bounty_status: BountyStatus;
      submission_status: SubmissionStatus;
      notification_type: NotificationType;
      report_target_type: ReportTargetType;
      report_status: ReportStatus;
      admin_action_type: AdminActionType;
      dataset_ownership_status: DatasetOwnershipStatus;
      escrow_state_status: EscrowStateStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type PublicTableName = keyof Database["public"]["Tables"];

export type Row<TTableName extends PublicTableName> =
  Database["public"]["Tables"][TTableName]["Row"];

export type Insert<TTableName extends PublicTableName> =
  Database["public"]["Tables"][TTableName]["Insert"];

export type Update<TTableName extends PublicTableName> =
  Database["public"]["Tables"][TTableName]["Update"];
