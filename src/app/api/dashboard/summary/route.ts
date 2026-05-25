import { NextResponse } from "next/server";

import { getDashboardSummary } from "@/lib/marketplace/queries";
import { getServerAuthUser } from "@/lib/supabase/server";

export async function GET() {
  const user = await getServerAuthUser();

  if (!user) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Sign in to view dashboard data.",
        },
      },
      { status: 401 },
    );
  }

  try {
    return NextResponse.json(await getDashboardSummary());
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "DASHBOARD_SUMMARY_FAILED",
          message: "Dashboard summary could not be loaded.",
        },
      },
      { status: 500 },
    );
  }
}
