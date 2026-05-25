export const appRoles = ["user", "admin", "moderator"] as const;

export type AppRole = (typeof appRoles)[number];

export const DEFAULT_APP_ROLE: AppRole = "user";

export type WalletLink = {
  id: string;
  userId: string;
  walletAddress: string;
  chainId: number;
  isPrimary: boolean;
  verifiedAt: string | null;
  createdAt: string;
};

export type AuthIdentity = {
  id: string;
  email: string;
  displayName: string;
  role: AppRole;
  walletLinks: WalletLink[];
};

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && appRoles.includes(value as AppRole);
}
