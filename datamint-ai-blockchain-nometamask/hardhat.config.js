require("@nomicfoundation/hardhat-ethers");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const rawPrivateKey = (process.env.PRIVATE_KEY || "").trim();
const cleanedPrivateKey = rawPrivateKey.replace(/^0x/, "");
const isValidPrivateKey = cleanedPrivateKey.length === 64 && /^[0-9a-fA-F]+$/.test(cleanedPrivateKey);
const PRIVATE_KEY = isValidPrivateKey ? `0x${cleanedPrivateKey}` : undefined;
const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";

/** @type import("hardhat/config").HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    hardhat: {},
    localhost: { url: "http://127.0.0.1:8545" },
    baseSepolia: {
      url: BASE_SEPOLIA_RPC_URL,
      chainId: 84532,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};

module.exports = config;
