import { NextResponse, type NextRequest } from "next/server";

import { getPurchaseState } from "@/lib/marketplace/queries";

export async function GET(request: NextRequest) {
  const datasetId = request.nextUrl.searchParams.get("datasetId");

  if (!datasetId) {
    return NextResponse.json(
      {
        error: {
          code: "DATASET_REQUIRED",
          message: "datasetId query parameter is required.",
        },
      },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await getPurchaseState(datasetId));
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "PURCHASE_STATE_FAILED",
          message: "Purchase state could not be loaded.",
        },
      },
      { status: 500 },
    );
  }
}
