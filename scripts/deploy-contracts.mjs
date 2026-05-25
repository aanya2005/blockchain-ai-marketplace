import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, "..");

const baseSepolia = {
  id: 84532,
  name: "Base Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.BASE_SEPOLIA_RPC_URL],
    },
  },
};

const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;

if (!privateKey || !privateKey.startsWith("0x")) {
  throw new Error("DEPLOYER_PRIVATE_KEY must be set to a 0x-prefixed private key.");
}

if (!rpcUrl) {
  throw new Error("BASE_SEPOLIA_RPC_URL must be configured.");
}

const account = privateKeyToAccount(privateKey);
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(rpcUrl),
});
const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(rpcUrl),
});

async function loadArtifact(name) {
  return JSON.parse(
    await readFile(join(root, "contracts", "artifacts", `${name}.json`), "utf8"),
  );
}

async function deploy(name, args = []) {
  const artifact = await loadArtifact(name);
  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (!receipt.contractAddress) {
    throw new Error(`${name} deployment did not return a contract address.`);
  }

  return {
    name,
    hash,
    address: receipt.contractAddress,
  };
}

const registry = await deploy("DatasetRegistry");
const escrow = await deploy("DatasetEscrow", [registry.address]);

console.log(JSON.stringify({ registry, escrow, chainId: baseSepolia.id }, null, 2));
