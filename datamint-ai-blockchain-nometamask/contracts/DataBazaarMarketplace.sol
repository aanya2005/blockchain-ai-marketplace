// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title DataBazaarMarketplace
/// @notice MVP marketplace for dataset ownership records, escrowed dataset purchases, and bounty payouts.
/// @dev Stores only IPFS CIDs / metadata references on-chain, not large dataset files.
contract DataBazaarMarketplace {
    address public owner;
    uint16 public platformFeeBps = 250; // 2.5%
    uint256 public datasetCount;
    uint256 public purchaseCount;
    uint256 public bountyCount;
    uint256 public bountySubmissionCount;
    uint256 public platformFeesCollected;
    bool private locked;

    enum PurchaseStatus {
        None,
        Escrowed,
        Released,
        Refunded
    }

    struct Dataset {
        uint256 id;
        address payable seller;
        string title;
        string description;
        string category;
        string tags;
        string dataCid;
        string metadataCid;
        string sizeLabel;
        uint256 priceWei;
        bool active;
        uint256 createdAt;
        uint256 totalSales;
    }

    struct Purchase {
        uint256 id;
        uint256 datasetId;
        address payable buyer;
        address payable seller;
        uint256 amountWei;
        PurchaseStatus status;
        uint256 createdAt;
        uint256 resolvedAt;
    }

    struct Bounty {
        uint256 id;
        address payable creator;
        string title;
        string description;
        string category;
        uint256 budgetWei;
        uint256 deadline;
        bool active;
        uint256 acceptedSubmissionId;
        uint256 createdAt;
    }

    struct BountySubmission {
        uint256 id;
        uint256 bountyId;
        address payable submitter;
        string dataCid;
        string metadataCid;
        string note;
        bool accepted;
        uint256 createdAt;
    }

    mapping(uint256 => Dataset) public datasets;
    mapping(uint256 => Purchase) public purchases;
    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => BountySubmission) public bountySubmissions;
    mapping(uint256 => uint256[]) private bountyToSubmissions;
    mapping(address => uint256[]) private sellerToDatasets;
    mapping(address => uint256[]) private buyerToPurchases;
    mapping(address => uint256[]) private creatorToBounties;
    mapping(address => uint256[]) private submitterToSubmissions;

    event DatasetListed(
        uint256 indexed datasetId,
        address indexed seller,
        string dataCid,
        string metadataCid,
        uint256 priceWei,
        string category
    );
    event DatasetStatusChanged(uint256 indexed datasetId, bool active);
    event DatasetPriceChanged(uint256 indexed datasetId, uint256 priceWei);
    event DatasetPurchased(
        uint256 indexed purchaseId,
        uint256 indexed datasetId,
        address indexed buyer,
        address seller,
        uint256 amountWei
    );
    event PaymentReleased(uint256 indexed purchaseId, uint256 indexed datasetId, address indexed seller, uint256 sellerAmountWei, uint256 feeWei);
    event PaymentRefunded(uint256 indexed purchaseId, uint256 indexed datasetId, address indexed buyer, uint256 amountWei);
    event BountyCreated(uint256 indexed bountyId, address indexed creator, string category, uint256 budgetWei, uint256 deadline);
    event BountySubmitted(uint256 indexed submissionId, uint256 indexed bountyId, address indexed submitter, string dataCid);
    event BountyAccepted(uint256 indexed bountyId, uint256 indexed submissionId, address indexed submitter, uint256 payoutWei, uint256 feeWei);
    event BountyCancelled(uint256 indexed bountyId, address indexed creator, uint256 refundWei);
    event PlatformFeeChanged(uint16 platformFeeBps);
    event FeesWithdrawn(address indexed to, uint256 amountWei);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "Reentrancy blocked");
        locked = true;
        _;
        locked = false;
    }

    constructor() {
        owner = msg.sender;
    }

    function listDataset(
        string calldata title,
        string calldata description,
        string calldata category,
        string calldata tags,
        string calldata dataCid,
        string calldata metadataCid,
        string calldata sizeLabel,
        uint256 priceWei
    ) external returns (uint256 datasetId) {
        require(bytes(title).length > 0, "Title required");
        require(bytes(dataCid).length > 0, "Data CID required");
        require(priceWei > 0, "Price required");

        datasetId = ++datasetCount;
        datasets[datasetId] = Dataset({
            id: datasetId,
            seller: payable(msg.sender),
            title: title,
            description: description,
            category: category,
            tags: tags,
            dataCid: dataCid,
            metadataCid: metadataCid,
            sizeLabel: sizeLabel,
            priceWei: priceWei,
            active: true,
            createdAt: block.timestamp,
            totalSales: 0
        });
        sellerToDatasets[msg.sender].push(datasetId);

        emit DatasetListed(datasetId, msg.sender, dataCid, metadataCid, priceWei, category);
    }

    function updateDatasetStatus(uint256 datasetId, bool active) external {
        Dataset storage dataset = datasets[datasetId];
        require(dataset.id != 0, "Dataset not found");
        require(msg.sender == dataset.seller || msg.sender == owner, "Not authorized");
        dataset.active = active;
        emit DatasetStatusChanged(datasetId, active);
    }

    function updateDatasetPrice(uint256 datasetId, uint256 priceWei) external {
        Dataset storage dataset = datasets[datasetId];
        require(dataset.id != 0, "Dataset not found");
        require(msg.sender == dataset.seller, "Only seller");
        require(priceWei > 0, "Price required");
        dataset.priceWei = priceWei;
        emit DatasetPriceChanged(datasetId, priceWei);
    }

    function buyDataset(uint256 datasetId) external payable nonReentrant returns (uint256 purchaseId) {
        Dataset storage dataset = datasets[datasetId];
        require(dataset.id != 0, "Dataset not found");
        require(dataset.active, "Dataset inactive");
        require(msg.sender != dataset.seller, "Seller cannot buy own dataset");
        require(msg.value == dataset.priceWei, "Incorrect payment");

        purchaseId = ++purchaseCount;
        purchases[purchaseId] = Purchase({
            id: purchaseId,
            datasetId: datasetId,
            buyer: payable(msg.sender),
            seller: dataset.seller,
            amountWei: msg.value,
            status: PurchaseStatus.Escrowed,
            createdAt: block.timestamp,
            resolvedAt: 0
        });
        buyerToPurchases[msg.sender].push(purchaseId);
        dataset.totalSales += 1;

        emit DatasetPurchased(purchaseId, datasetId, msg.sender, dataset.seller, msg.value);
    }

    /// @notice Buyer confirms delivery, or admin resolves a dispute in seller's favor.
    function releasePayment(uint256 purchaseId) public nonReentrant {
        Purchase storage purchase = purchases[purchaseId];
        require(purchase.id != 0, "Purchase not found");
        require(purchase.status == PurchaseStatus.Escrowed, "Not escrowed");
        require(msg.sender == purchase.buyer || msg.sender == owner, "Not authorized");

        purchase.status = PurchaseStatus.Released;
        purchase.resolvedAt = block.timestamp;

        uint256 fee = (purchase.amountWei * platformFeeBps) / 10_000;
        uint256 sellerAmount = purchase.amountWei - fee;
        platformFeesCollected += fee;

        (bool sent, ) = purchase.seller.call{value: sellerAmount}("");
        require(sent, "Seller payout failed");

        emit PaymentReleased(purchaseId, purchase.datasetId, purchase.seller, sellerAmount, fee);
    }

    /// @notice Seller can voluntarily refund, or admin resolves a dispute in buyer's favor.
    function refundPurchase(uint256 purchaseId) public nonReentrant {
        Purchase storage purchase = purchases[purchaseId];
        require(purchase.id != 0, "Purchase not found");
        require(purchase.status == PurchaseStatus.Escrowed, "Not escrowed");
        require(msg.sender == purchase.seller || msg.sender == owner, "Not authorized");

        purchase.status = PurchaseStatus.Refunded;
        purchase.resolvedAt = block.timestamp;

        (bool sent, ) = purchase.buyer.call{value: purchase.amountWei}("");
        require(sent, "Refund failed");

        emit PaymentRefunded(purchaseId, purchase.datasetId, purchase.buyer, purchase.amountWei);
    }

    function resolveDispute(uint256 purchaseId, bool releaseToSeller) external onlyOwner {
        if (releaseToSeller) {
            releasePayment(purchaseId);
        } else {
            refundPurchase(purchaseId);
        }
    }

    function createBounty(
        string calldata title,
        string calldata description,
        string calldata category,
        uint256 deadline
    ) external payable returns (uint256 bountyId) {
        require(bytes(title).length > 0, "Title required");
        require(msg.value > 0, "Budget required");
        require(deadline > block.timestamp, "Deadline must be future");

        bountyId = ++bountyCount;
        bounties[bountyId] = Bounty({
            id: bountyId,
            creator: payable(msg.sender),
            title: title,
            description: description,
            category: category,
            budgetWei: msg.value,
            deadline: deadline,
            active: true,
            acceptedSubmissionId: 0,
            createdAt: block.timestamp
        });
        creatorToBounties[msg.sender].push(bountyId);

        emit BountyCreated(bountyId, msg.sender, category, msg.value, deadline);
    }

    function submitBounty(
        uint256 bountyId,
        string calldata dataCid,
        string calldata metadataCid,
        string calldata note
    ) external returns (uint256 submissionId) {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.id != 0, "Bounty not found");
        require(bounty.active, "Bounty inactive");
        require(block.timestamp <= bounty.deadline, "Bounty expired");
        require(bytes(dataCid).length > 0, "Data CID required");

        submissionId = ++bountySubmissionCount;
        bountySubmissions[submissionId] = BountySubmission({
            id: submissionId,
            bountyId: bountyId,
            submitter: payable(msg.sender),
            dataCid: dataCid,
            metadataCid: metadataCid,
            note: note,
            accepted: false,
            createdAt: block.timestamp
        });
        bountyToSubmissions[bountyId].push(submissionId);
        submitterToSubmissions[msg.sender].push(submissionId);

        emit BountySubmitted(submissionId, bountyId, msg.sender, dataCid);
    }

    function acceptBountySubmission(uint256 bountyId, uint256 submissionId) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        BountySubmission storage submission = bountySubmissions[submissionId];
        require(bounty.id != 0, "Bounty not found");
        require(submission.id != 0, "Submission not found");
        require(submission.bountyId == bountyId, "Wrong bounty");
        require(bounty.active, "Bounty inactive");
        require(msg.sender == bounty.creator || msg.sender == owner, "Not authorized");

        bounty.active = false;
        bounty.acceptedSubmissionId = submissionId;
        submission.accepted = true;

        uint256 fee = (bounty.budgetWei * platformFeeBps) / 10_000;
        uint256 payout = bounty.budgetWei - fee;
        platformFeesCollected += fee;

        (bool sent, ) = submission.submitter.call{value: payout}("");
        require(sent, "Bounty payout failed");

        emit BountyAccepted(bountyId, submissionId, submission.submitter, payout, fee);
    }

    function cancelBounty(uint256 bountyId) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.id != 0, "Bounty not found");
        require(bounty.active, "Bounty inactive");
        require(msg.sender == bounty.creator || msg.sender == owner, "Not authorized");

        bounty.active = false;
        uint256 refundAmount = bounty.budgetWei;
        bounty.budgetWei = 0;

        (bool sent, ) = bounty.creator.call{value: refundAmount}("");
        require(sent, "Bounty refund failed");

        emit BountyCancelled(bountyId, bounty.creator, refundAmount);
    }

    function getSellerDatasets(address seller) external view returns (uint256[] memory) {
        return sellerToDatasets[seller];
    }

    function getBuyerPurchases(address buyer) external view returns (uint256[] memory) {
        return buyerToPurchases[buyer];
    }

    function getCreatorBounties(address creator) external view returns (uint256[] memory) {
        return creatorToBounties[creator];
    }

    function getSubmitterSubmissions(address submitter) external view returns (uint256[] memory) {
        return submitterToSubmissions[submitter];
    }

    function getBountySubmissions(uint256 bountyId) external view returns (uint256[] memory) {
        return bountyToSubmissions[bountyId];
    }

    function setPlatformFeeBps(uint16 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Max fee is 10%");
        platformFeeBps = newFeeBps;
        emit PlatformFeeChanged(newFeeBps);
    }

    function withdrawFees(address payable to) external onlyOwner nonReentrant {
        require(to != address(0), "Bad recipient");
        uint256 amount = platformFeesCollected;
        require(amount > 0, "No fees");
        platformFeesCollected = 0;
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Withdraw failed");
        emit FeesWithdrawn(to, amount);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Bad owner");
        owner = newOwner;
    }
}
