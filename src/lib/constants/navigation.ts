export type NavigationItem = {
  href: string;
  label: string;
  description: string;
};

export const primaryNavigation: NavigationItem[] = [
  {
    href: "/",
    label: "Home",
    description: "NeuroLedger platform overview",
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    description: "Dataset discovery route boundary",
  },
  {
    href: "/upload",
    label: "Upload",
    description: "Dataset upload route boundary",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "User workspace route boundary",
  },
  {
    href: "/bounties",
    label: "Bounties",
    description: "Dataset bounty route boundary",
  },
  {
    href: "/admin",
    label: "Admin",
    description: "Moderation route boundary",
  },
];
