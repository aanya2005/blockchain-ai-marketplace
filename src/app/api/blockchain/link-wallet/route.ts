import { NextResponse, type NextRequest } from "next/server";
import { verifyMessage } from "viem";

import { getBlockchainErrorPayload, BlockchainError } from "@/lib/blockchain/errors";
import { walletLinkSchema } from "@/lib/blockchain/schemas";
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
      throw new BlockchainError("UNAUTHORIZED", "Sign in before linking a wallet.", 401);
    }

    const input = walletLinkSchema.parse(await request.json());

    if (
      !input.message.includes(`User: ${user.id}`) ||
      !input.message.includes(`Wallet: ${input.address}`) ||
      !input.message.includes(`Chain ID: ${input.chainId}`)
    ) {
      throw new BlockchainError(
        "WALLET_VERIFICATION_FAILED",
        "Wallet signature message does not match the authenticated user.",
        422,
      );
    }

    const verified = await verifyMessage({
      address: input.address,
      message: input.message,
      signature: input.signature as `0x${string}`,
    });

    if (!verified) {
      throw new BlockchainError(
        "WALLET_VERIFICATION_FAILED",
        "Wallet signature could not be verified.",
        422,
      );
    }

    await supabase
      .from("wallet_links")
      .update({ is_primary: false })
      .eq("user_id", user.id)
      .eq("chain_id", input.chainId);

    const { data, error } = await supabase
      .from("wallet_links")
      .upsert(
        {
          user_id: user.id,
          wallet_address: input.address,
          chain_id: input.chainId,
          is_primary: true,
          verified_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,wallet_address,chain_id",
        },
      )
      .select("*")
      .single();

    if (error || !data) {
      throw new BlockchainError("DATABASE_ERROR", "Wallet link could not be saved.", 500);
    }

    return NextResponse.json({ walletLink: data });
  } catch (error) {
    const payload = getBlockchainErrorPayload(
      error instanceof Error && error.name === "ZodError"
        ? new BlockchainError("VALIDATION_ERROR", "Wallet link payload is invalid.")
        : error,
    );
    return NextResponse.json(payload.body, { status: payload.status });
  }
}
