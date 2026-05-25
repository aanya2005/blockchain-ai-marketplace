import { NextResponse, type NextRequest } from "next/server";

import { getBlockchainErrorPayload, BlockchainError } from "@/lib/blockchain/errors";
import { blockchainEventSyncSchema } from "@/lib/blockchain/schemas";
import type { Json } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      throw new BlockchainError(
        "CONFIGURATION_ERROR",
        "Supabase is not configured.",
        503,
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new BlockchainError("UNAUTHORIZED", "Sign in before syncing events.", 401);
    }

    const input = blockchainEventSyncSchema.parse(await request.json());
    const { data, error } = await supabase
      .from("blockchain_events")
      .upsert(
        {
          chain_id: input.chainId,
          contract_address: input.contractAddress,
          event_name: input.eventName,
          transaction_hash: input.transactionHash,
          log_index: input.logIndex,
          block_number: input.blockNumber,
          payload: input.payload as Json,
          processed_at: new Date().toISOString(),
        },
        {
          onConflict: "transaction_hash,log_index",
        },
      )
      .select("id")
      .single();

    if (error || !data) {
      throw new BlockchainError(
        "DATABASE_ERROR",
        "Blockchain event could not be synchronized.",
        500,
      );
    }

    return NextResponse.json({ eventId: data.id, status: "processed" });
  } catch (error) {
    const payload = getBlockchainErrorPayload(
      error instanceof Error && error.name === "ZodError"
        ? new BlockchainError("VALIDATION_ERROR", "Blockchain event payload is invalid.")
        : error,
    );
    return NextResponse.json(payload.body, { status: payload.status });
  }
}
