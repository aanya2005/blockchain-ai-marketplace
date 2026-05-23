export type EnvironmentVariable = {
  key: string;
  scope: "client" | "server";
  requiredFor: string;
};

export const environmentVariables: EnvironmentVariable[] = [
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    scope: "client",
    requiredFor: "Supabase client configuration",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    scope: "client",
    requiredFor: "Supabase browser sessions",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    scope: "server",
    requiredFor: "Privileged server-side Supabase operations",
  },
  {
    key: "PINATA_JWT",
    scope: "server",
    requiredFor: "Server-side IPFS pinning",
  },
  {
    key: "THIRDWEB_SECRET_KEY",
    scope: "server",
    requiredFor: "Server-side blockchain operations",
  },
  {
    key: "NEXT_PUBLIC_THIRDWEB_CLIENT_ID",
    scope: "client",
    requiredFor: "Thirdweb wallet SDK initialization",
  },
  {
    key: "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID",
    scope: "client",
    requiredFor: "WalletConnect-compatible wallet sessions",
  },
  {
    key: "BASE_SEPOLIA_RPC_URL",
    scope: "server",
    requiredFor: "Base Sepolia contract deployment and indexing",
  },
];
