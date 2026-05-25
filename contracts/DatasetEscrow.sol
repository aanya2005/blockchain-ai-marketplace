// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IDatasetRegistry {
    function verifyOwnership(bytes32 datasetId, address expectedOwner)
        external
        view
        returns (bool);
}

contract DatasetEscrow {
    enum PurchaseStatus {
        None,
        Funded,
        Released,
        Refunded
    }

    struct Purchase {
        address buyer;
        address seller;
        bytes32 datasetId;
        uint256 amount;
        PurchaseStatus status;
        uint256 createdAt;
        uint256 releasedAt;
    }

    IDatasetRegistry public immutable registry;
    mapping(bytes32 => Purchase) private purchases;
    mapping(bytes32 => mapping(address => bool)) private purchasedByBuyer;

    event PurchaseFunded(
        bytes32 indexed purchaseId,
        bytes32 indexed datasetId,
        address indexed buyer,
        address seller,
        uint256 amount
    );
    event PurchaseReleased(
        bytes32 indexed purchaseId,
        bytes32 indexed datasetId,
        address indexed buyer,
        address seller,
        uint256 amount
    );
    event PurchaseRefunded(
        bytes32 indexed purchaseId,
        bytes32 indexed datasetId,
        address indexed buyer,
        uint256 amount
    );

    error InvalidRegistry();
    error InvalidSeller();
    error InvalidAmount();
    error DuplicatePurchase(bytes32 datasetId, address buyer);
    error PurchaseNotFunded(bytes32 purchaseId);
    error UnauthorizedSeller();
    error TransferFailed();

    constructor(address registryAddress) {
        if (registryAddress == address(0)) {
            revert InvalidRegistry();
        }

        registry = IDatasetRegistry(registryAddress);
    }

    function fundPurchase(bytes32 datasetId, address seller) external payable returns (bytes32) {
        if (seller == address(0) || seller == msg.sender) {
            revert InvalidSeller();
        }
        if (msg.value == 0) {
            revert InvalidAmount();
        }
        if (!registry.verifyOwnership(datasetId, seller)) {
            revert InvalidSeller();
        }
        if (purchasedByBuyer[datasetId][msg.sender]) {
            revert DuplicatePurchase(datasetId, msg.sender);
        }

        bytes32 purchaseId = keccak256(
            abi.encodePacked(datasetId, msg.sender, seller, block.chainid)
        );
        purchases[purchaseId] = Purchase({
            buyer: msg.sender,
            seller: seller,
            datasetId: datasetId,
            amount: msg.value,
            status: PurchaseStatus.Funded,
            createdAt: block.timestamp,
            releasedAt: 0
        });
        purchasedByBuyer[datasetId][msg.sender] = true;

        emit PurchaseFunded(purchaseId, datasetId, msg.sender, seller, msg.value);
        return purchaseId;
    }

    function releasePurchase(bytes32 purchaseId) external {
        Purchase storage purchase = purchases[purchaseId];
        if (purchase.status != PurchaseStatus.Funded) {
            revert PurchaseNotFunded(purchaseId);
        }
        if (purchase.seller != msg.sender) {
            revert UnauthorizedSeller();
        }

        purchase.status = PurchaseStatus.Released;
        purchase.releasedAt = block.timestamp;

        (bool success, ) = purchase.seller.call{value: purchase.amount}("");
        if (!success) {
            revert TransferFailed();
        }

        emit PurchaseReleased(
            purchaseId,
            purchase.datasetId,
            purchase.buyer,
            purchase.seller,
            purchase.amount
        );
    }

    function getPurchase(bytes32 purchaseId) external view returns (Purchase memory) {
        return purchases[purchaseId];
    }

    function hasPurchased(bytes32 datasetId, address buyer) external view returns (bool) {
        return purchasedByBuyer[datasetId][buyer];
    }
}
