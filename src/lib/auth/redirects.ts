const defaultAuthenticatedRedirect = "/dashboard";

export function getSafeRedirectPath(value: string | null | undefined): string {
  if (!value) {
    return defaultAuthenticatedRedirect;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return defaultAuthenticatedRedirect;
  }

  if (value.includes("\\") || value.includes("\n") || value.includes("\r")) {
    return defaultAuthenticatedRedirect;
  }

  return value;
}
