export function truncateCid(cid: string | null | undefined, edgeLength = 8): string {
  if (!cid) {
    return "Not pinned";
  }

  if (cid.length <= edgeLength * 2 + 3) {
    return cid;
  }

  return `${cid.slice(0, edgeLength)}...${cid.slice(-edgeLength)}`;
}

export function formatDatasetPrice(price: number, currency: string): string {
  if (price === 0) {
    return "Free";
  }

  return `${Number(price).toLocaleString("en", {
    maximumFractionDigits: 6,
  })} ${currency}`;
}

export function formatCompactNumber(value: number | null | undefined): string {
  return Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value ?? 0);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
