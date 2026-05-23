export type PhaseStatus = "available" | "planned";

export type PhaseRoute = {
  href: string;
  title: string;
  status: PhaseStatus;
  summary: string;
};

export const phaseRoutes: PhaseRoute[] = [
  {
    href: "/marketplace",
    title: "Marketplace",
    status: "planned",
    summary: "Browse, filter, and purchase validated datasets.",
  },
  {
    href: "/upload",
    title: "Upload",
    status: "planned",
    summary: "Encrypt, validate, and publish datasets to decentralized storage.",
  },
  {
    href: "/dashboard",
    title: "Dashboard",
    status: "planned",
    summary: "Review owned datasets, purchases, earnings, and reputation.",
  },
  {
    href: "/bounties",
    title: "Bounties",
    status: "planned",
    summary: "Create dataset requests and manage contributor submissions.",
  },
  {
    href: "/admin",
    title: "Admin",
    status: "planned",
    summary: "Moderate users, datasets, reports, and platform activity.",
  },
];
