import { NextResponse, type NextRequest } from "next/server";

import { getBlockchainContractAddresses } from "@/lib/blockchain/env";
import { getBlockchainErrorPayload, BlockchainError } from "@/lib/blockchain/errors";
import { datasetRegistrationPersistenceSchema } from "@/lib/blockchain/schemas";
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
      throw new BlockchainError(
        "UNAUTHORIZED",
        "Sign in before registering dataset ownership.",
        401,
      );
    }

    const input = datasetRegistrationPersistenceSchema.parse(await request.json());
    const configuredRegistry = getBlockchainContractAddresses().datasetRegistry;

    if (
      configuredRegistry &&
      configuredRegistry.toLowerCase() !== input.registryContractAddress.toLowerCase()
    ) {
      throw new BlockchainError(
        "VALIDATION_ERROR",
        "Registry contract address does not match NeuroLedger configuration.",
        422,
      );
    }

    const { data: dataset, error: datasetError } = await supabase
      .from("datasets")
      .select("id,uploader_id,cid,upload_status")
      .eq("id", input.datasetId)
      .maybeSingle();

    if (datasetError || !dataset) {
      throw new BlockchainError("VALIDATION_ERROR", "Dataset was not found.", 404);
    }

    if (dataset.uploader_id !== user.id) {
      throw new BlockchainError(
        "UNAUTHORIZED",
        "Only the dataset uploader can register ownership.",
        403,
      );
    }

    if (!dataset.cid || dataset.upload_status !== "stored") {
      throw new BlockchainError(
        "VALIDATION_ERROR",
        "Dataset must be stored on IPFS before ownership registration.",
        422,
      );
    }

    await verifyBaseSepoliaTransaction({
      transactionHash: input.transactionHash,
      expectedFrom: input.walletAddress,
      expectedTo: input.registryContractAddress,
    });

    const now = new Date().toISOString();
    const { error: ownershipError } = await supabase.from("dataset_ownerships").insert({
      dataset_id: input.datasetId,
      owner_id: user.id,
      wallet_address: input.walletAddress,
      chain_id: input.chainId,
      registry_contract_address: input.registryContractAddress,
      registry_dataset_id: input.registryDatasetId,
      dataset_hash: input.datasetHash,
      cid: dataset.cid,
      transaction_hash: input.transactionHash,
      status: "registered",
      registered_at: now,
    });

    if (ownershipError) {
      const duplicate = ownershipError.code === "23505";
      throw new BlockchainError(
        duplicate ? "DUPLICATE_TRANSACTION" : "DATABASE_ERROR",
        duplicate
          ? "This dataset or transaction has already been registered."
          : "Ownership registration could not be persisted.",
        duplicate ? 409 : 500,
      );
    }

    await supabase
      .from("datasets")
      .update({
        blockchain_hash: input.datasetHash,
        registry_chain_id: input.chainId,
        registry_contract_address: input.registryContractAddress,
        registry_dataset_id: input.registryDatasetId,
        registry_transaction_hash: input.transactionHash,
        registered_on_chain_at: now,
      })
      .eq("id", input.datasetId)
      .eq("uploader_id", user.id);

    await supabase.from("transactions").insert({
      actor_id: user.id,
      dataset_id: input.datasetId,
      transaction_type: "dataset_registration",
      status: "confirmed",
      chain_id: input.chainId,
      tx_hash: input.transactionHash,
      from_wallet_address: input.walletAddress,
      contract_address: input.registryContractAddress,
      metadata: {
        registryDatasetId: input.registryDatasetId,
        datasetHash: input.datasetHash,
      },
    });

    return NextResponse.json({ status: "registered" });
  } catch (error) {
    const payload = getBlockchainErrorPayload(
      error instanceof Error && error.name === "ZodError"
        ? new BlockchainError(
            "VALIDATION_ERROR",
            "Dataset registration payload is invalid.",
          )
        : error,
    );
    return NextResponse.json(payload.body, { status: payload.status });
  }
}
