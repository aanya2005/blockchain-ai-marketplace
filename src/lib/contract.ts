export const MARKETPLACE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS || "";
export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_SEPOLIA_CHAIN_ID_HEX = "0x14A34";

export const BASE_SEPOLIA_PARAMS = {
  chainId: BASE_SEPOLIA_CHAIN_ID_HEX,
  chainName: "Base Sepolia",
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://sepolia.base.org"],
  blockExplorerUrls: ["https://sepolia.basescan.org"],
};

export const MARKETPLACE_ABI = [
  "function owner() view returns (address)",
  "function platformFeeBps() view returns (uint16)",
  "function datasetCount() view returns (uint256)",
  "function purchaseCount() view returns (uint256)",
  "function bountyCount() view returns (uint256)",
  "function platformFeesCollected() view returns (uint256)",
  "function datasets(uint256) view returns (uint256 id, address seller, string title, string description, string category, string tags, string dataCid, string metadataCid, string sizeLabel, uint256 priceWei, bool active, uint256 createdAt, uint256 totalSales)",
  "function purchases(uint256) view returns (uint256 id, uint256 datasetId, address buyer, address seller, uint256 amountWei, uint8 status, uint256 createdAt, uint256 resolvedAt)",
  "function bounties(uint256) view returns (uint256 id, address creator, string title, string description, string category, uint256 budgetWei, uint256 deadline, bool active, uint256 acceptedSubmissionId, uint256 createdAt)",
  "function bountySubmissions(uint256) view returns (uint256 id, uint256 bountyId, address submitter, string dataCid, string metadataCid, string note, bool accepted, uint256 createdAt)",
  "function listDataset(string title, string description, string category, string tags, string dataCid, string metadataCid, string sizeLabel, uint256 priceWei) returns (uint256)",
  "function updateDatasetStatus(uint256 datasetId, bool active)",
  "function updateDatasetPrice(uint256 datasetId, uint256 priceWei)",
  "function buyDataset(uint256 datasetId) payable returns (uint256)",
  "function releasePayment(uint256 purchaseId)",
  "function refundPurchase(uint256 purchaseId)",
  "function resolveDispute(uint256 purchaseId, bool releaseToSeller)",
  "function createBounty(string title, string description, string category, uint256 deadline) payable returns (uint256)",
  "function submitBounty(uint256 bountyId, string dataCid, string metadataCid, string note) returns (uint256)",
  "function acceptBountySubmission(uint256 bountyId, uint256 submissionId)",
  "function cancelBounty(uint256 bountyId)",
  "function getSellerDatasets(address seller) view returns (uint256[])",
  "function getBuyerPurchases(address buyer) view returns (uint256[])",
  "function getCreatorBounties(address creator) view returns (uint256[])",
  "function getSubmitterSubmissions(address submitter) view returns (uint256[])",
  "function getBountySubmissions(uint256 bountyId) view returns (uint256[])",
  "event DatasetListed(uint256 indexed datasetId, address indexed seller, string dataCid, string metadataCid, uint256 priceWei, string category)",
  "event DatasetPurchased(uint256 indexed purchaseId, uint256 indexed datasetId, address indexed buyer, address seller, uint256 amountWei)",
  "event PaymentReleased(uint256 indexed purchaseId, uint256 indexed datasetId, address indexed seller, uint256 sellerAmountWei, uint256 feeWei)",
  "event PaymentRefunded(uint256 indexed purchaseId, uint256 indexed datasetId, address indexed buyer, uint256 amountWei)",
  "event BountyCreated(uint256 indexed bountyId, address indexed creator, string category, uint256 budgetWei, uint256 deadline)",
  "event BountySubmitted(uint256 indexed submissionId, uint256 indexed bountyId, address indexed submitter, string dataCid)",
  "event BountyAccepted(uint256 indexed bountyId, uint256 indexed submissionId, address indexed submitter, uint256 payoutWei, uint256 feeWei)",
] as const;
