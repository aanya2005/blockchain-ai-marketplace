import { NextResponse, type NextRequest } from "next/server";

import { getBlockchainContractAddresses } from "@/lib/blockchain/env";
import { getBlockchainErrorPayload, BlockchainError } from "@/lib/blockchain/errors";
import { escrowPersistenceSchema } from "@/lib/blockchain/schemas";
import { verifyBaseSepoliaTransaction } from "@/lib/blockchain/server";
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
      throw new BlockchainError("UNAUTHORIZED", "Sign in before funding escrow.", 401);
    }

    const input = escrowPersistenceSchema.parse(await request.json());
    const configuredEscrow = getBlockchainContractAddresses().datasetEscrow;

    if (
      configuredEscrow &&
      configuredEscrow.toLowerCase() !== input.escrowContractAddress.toLowerCase()
    ) {
      throw new BlockchainError(
        "VALIDATION_ERROR",
        "Escrow contract address does not match NeuroLedger configuration.",
        422,
      );
    }

    await verifyBaseSepoliaTransaction({
      transactionHash: input.fundTransactionHash,
      expectedFrom: input.buyerWalletAddress,
      expectedTo: input.escrowContractAddress,
    });

    const { data: dataset, error: datasetError } = await supabase
      .from("datasets")
      .select("id,uploader_id")
      .eq("id", input.datasetId)
      .maybeSingle();

    if (datasetError || !dataset) {
      throw new BlockchainError("VALIDATION_ERROR", "Dataset was not found.", 404);
    }

    if (dataset.uploader_id !== input.sellerId || input.sellerId === user.id) {
      throw new BlockchainError("VALIDATION_ERROR", "Invalid escrow seller.", 422);
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        buyer_id: user.id,
        dataset_id: input.datasetId,
        status: "pending",
      })
      .select("id")
      .single();

    if (purchaseError || !purchase) {
      const duplicate = purchaseError?.code === "23505";
      throw new BlockchainError(
        duplicate ? "DUPLICATE_TRANSACTION" : "DATABASE_ERROR",
        duplicate
          ? "This dataset has already been purchased or escrowed by your account."
          : "Purchase history could not be created.",
        duplicate ? 409 : 500,
      );
    }

    const { error: escrowError } = await supabase.from("escrow_states").insert({
      purchase_id: purchase.id,
      dataset_id: input.datasetId,
      buyer_id: user.id,
      seller_id: input.sellerId,
      buyer_wallet_address: input.buyerWalletAddress,
      seller_wallet_address: input.sellerWalletAddress,
      chain_id: input.chainId,
      escrow_contract_address: input.escrowContractAddress,
      escrow_purchase_id: input.escrowPurchaseId,
      fund_transaction_hash: input.fundTransactionHash,
      amount_wei: input.amountWei,
      status: "funded",
    });

    if (escrowError) {
      throw new BlockchainError(
        escrowError.code === "23505" ? "DUPLICATE_TRANSACTION" : "DATABASE_ERROR",
        "Escrow state could not be persisted.",
        escrowError.code === "23505" ? 409 : 500,
      );
    }

    await supabase.from("transactions").insert({
      actor_id: user.id,
      dataset_id: input.datasetId,
      related_purchase_id: purchase.id,
      transaction_type: "dataset_purchase",
      status: "confirmed",
      chain_id: input.chainId,
      tx_hash: input.fundTransactionHash,
      from_wallet_address: input.buyerWalletAddress,
      to_wallet_address: input.sellerWalletAddress,
      contract_address: input.escrowContractAddress,
      metadata: {
        escrowPurchaseId: input.escrowPurchaseId,
        amountWei: input.amountWei,
      },
    });

    return NextResponse.json({ purchaseId: purchase.id, status: "funded" });
  } catch (error) {
    const payload = getBlockchainErrorPayload(
      error instanceof Error && error.name === "ZodError"
        ? new BlockchainError("VALIDATION_ERROR", "Escrow payload is invalid.")
        : error,
    );
    return NextResponse.json(payload.body, { status: payload.status });
  }
}
