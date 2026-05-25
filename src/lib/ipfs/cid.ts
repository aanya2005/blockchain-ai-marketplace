import { UploadError } from "@/lib/upload/errors";

const cidV0Pattern = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
const cidV1Pattern = /^b[a-z2-7]{50,}$/;

export function isValidCid(value: string): boolean {
  return cidV0Pattern.test(value) || cidV1Pattern.test(value);
}

export function assertValidCid(value: string): string {
  if (!isValidCid(value)) {
    throw new UploadError("STORAGE_ERROR", "Pinata returned an invalid IPFS CID.", 502);
  }

  return value;
}

export function createIpfsUri(cid: string): string {
  return `ipfs://${assertValidCid(cid)}`;
}

export function createPinataGatewayUrl(cid: string, gatewayBaseUrl?: string): string {
  const normalizedGateway =
    gatewayBaseUrl?.replace(/\/+$/, "") || "https://gateway.pinata.cloud/ipfs";

  return `${normalizedGateway}/${assertValidCid(cid)}`;
}
