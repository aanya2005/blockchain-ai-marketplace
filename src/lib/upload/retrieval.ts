import { assertValidCid, createPinataGatewayUrl } from "@/lib/ipfs/cid";
import { decryptDatasetBuffer, type EncryptionMetadata } from "@/lib/upload/encryption";
import { UploadError } from "@/lib/upload/errors";

export type RetrieveEncryptedDatasetInput = {
  cid: string;
  encryptionMetadata: EncryptionMetadata;
  gatewayUrl?: string;
  fetchImplementation?: typeof fetch;
};

export async function retrieveAndDecryptDataset({
  cid,
  encryptionMetadata,
  gatewayUrl,
  fetchImplementation = fetch,
}: RetrieveEncryptedDatasetInput): Promise<Buffer> {
  const validCid = assertValidCid(cid);
  const response = await fetchImplementation(
    gatewayUrl ?? createPinataGatewayUrl(validCid, process.env.PINATA_GATEWAY_URL),
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new UploadError(
      "STORAGE_ERROR",
      `Encrypted dataset retrieval failed with status ${response.status}.`,
      response.status >= 500 ? 502 : 404,
    );
  }

  const encryptedBuffer = Buffer.from(await response.arrayBuffer());

  return decryptDatasetBuffer(encryptedBuffer, encryptionMetadata);
}
