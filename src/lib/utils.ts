export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function truncateAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ipfsToGateway(cidOrUri: string) {
  if (!cidOrUri) return "";
  const cid = cidOrUri.replace("ipfs://", "");
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

export function formatEth(value: bigint | string | number) {
  try {
    const big = typeof value === "bigint" ? value : BigInt(value);
    const whole = big / 10n ** 18n;
    const decimals = ((big % 10n ** 18n) / 10n ** 14n).toString().padStart(4, "0");
    return `${whole}.${decimals} ETH`;
  } catch {
    return "0.0000 ETH";
  }
}
