import { NextResponse, type NextRequest } from "next/server";

import { parseMarketplaceFilters } from "@/lib/marketplace/filters";
import { searchMarketplaceDatasets } from "@/lib/marketplace/queries";

export async function GET(request: NextRequest) {
  try {
    const filters = parseMarketplaceFilters(request.nextUrl.searchParams);
    const result = await searchMarketplaceDatasets(filters);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "MARKETPLACE_SEARCH_FAILED",
          message: "Marketplace datasets could not be loaded.",
        },
      },
      { status: 500 },
    );
  }
}
