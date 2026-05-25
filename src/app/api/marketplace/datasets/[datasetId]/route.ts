import { NextResponse, type NextRequest } from "next/server";

import { getDatasetDetail } from "@/lib/marketplace/queries";

type RouteContext = {
  params: Promise<{
    datasetId: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { datasetId } = await context.params;
    const dataset = await getDatasetDetail(datasetId);

    if (!dataset) {
      return NextResponse.json(
        {
          error: {
            code: "DATASET_NOT_FOUND",
            message: "Dataset could not be found.",
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ dataset });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "DATASET_LOAD_FAILED",
          message: "Dataset details could not be loaded.",
        },
      },
      { status: 500 },
    );
  }
}
