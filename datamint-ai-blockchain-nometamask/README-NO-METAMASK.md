# Run without MetaMask

This version has demo mode. It uses fake demo blockchain responses and fake IPFS CIDs so you can run and click through the app without MetaMask, Pinata, a private key, or a deployed contract.

## Windows PowerShell

```powershell
npm install
Copy-Item .env.example .env.local
npm run compile
npm run dev
```

Open http://localhost:3000

## Important

In `.env.local`, keep:

```env
NEXT_PUBLIC_DEMO_MODE=true
PRIVATE_KEY=
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=
```

Do not run `npm run deploy:base-sepolia` unless you later create a real wallet.
