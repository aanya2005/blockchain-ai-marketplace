# DataMint AI — Blockchain Backend MVP

A Vercel-ready Next.js app for a decentralized AI training data marketplace.

This package includes:

- **Beautiful marketplace UI** based on the mockup screens.
- **Solidity smart contract** for dataset ownership records, purchase escrow, refunds, bounty creation, bounty submissions, and bounty payouts.
- **IPFS upload API route** using Pinata.
- **Wallet integration** through MetaMask / Coinbase Wallet-compatible injected wallets.
- **Base Sepolia deployment setup** using Hardhat.

AI validation and user scoring are intentionally not implemented yet.

---

## 1. Install

```bash
npm install
```

---

## 2. Create environment file

Copy `.env.example` into `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:

```bash
PINATA_JWT=your_pinata_jwt_here
PRIVATE_KEY=your_testnet_wallet_private_key_without_0x
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

You need a little Base Sepolia ETH in the deployer wallet.

---

## 3. Deploy the smart contract

```bash
npm run compile
npm run deploy:base-sepolia
```

The deploy script prints something like:

```bash
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0x...
```

Paste that address into `.env.local`.

---

## 4. Run locally

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

## 5. Deploy to Vercel

1. Push this folder to GitHub.
2. Go to Vercel and import the GitHub repo.
3. Add these environment variables in Vercel Project Settings:

```bash
PINATA_JWT=your_pinata_jwt_here
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

4. Click Deploy.

After deployment, Vercel gives you a clickable hosted link.

---

## What the contract does

### Dataset marketplace

- `listDataset(...)`
- `updateDatasetStatus(...)`
- `updateDatasetPrice(...)`
- `buyDataset(...)`

### Escrow

- Buyer pays into the contract using `buyDataset(...)`.
- Buyer can release payment with `releasePayment(...)`.
- Seller or admin can refund with `refundPurchase(...)`.
- Admin can resolve disputes with `resolveDispute(...)`.

### Bounties

- Developers fund requests with `createBounty(...)`.
- Contributors submit IPFS CIDs with `submitBounty(...)`.
- Bounty creator accepts a submission and releases payout with `acceptBountySubmission(...)`.
- Creator/admin can cancel active bounties with `cancelBounty(...)`.

---

## Important security notes

This is an MVP for testnet/demo use.

Before mainnet:

- Get the contract audited.
- Add production key management for encrypted dataset access.
- Add terms/moderation for illegal or sensitive datasets.
- Add rate limits and file scanning.
- Do not upload private real-world datasets until encryption and access control are complete.
