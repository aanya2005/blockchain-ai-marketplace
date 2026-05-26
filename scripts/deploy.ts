import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying DataBazaarMarketplace with:", deployer.address);

  const Marketplace = await ethers.getContractFactory("DataBazaarMarketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  console.log("DataBazaarMarketplace deployed to:", address);
  console.log("Set this in Vercel and .env.local:");
  console.log(`NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
