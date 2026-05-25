// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DatasetRegistry {
    struct DatasetRecord {
        address owner;
        bytes32 datasetHash;
        string cid;
        string metadataUri;
        uint256 registeredAt;
        bool active;
    }

    mapping(bytes32 => DatasetRecord) private records;
    mapping(address => bytes32[]) private ownerDatasets;

    event DatasetRegistered(
        bytes32 indexed datasetId,
        address indexed owner,
        bytes32 indexed datasetHash,
        string cid,
        string metadataUri
    );
    event DatasetDeactivated(bytes32 indexed datasetId, address indexed owner);

    error DatasetAlreadyRegistered(bytes32 datasetId);
    error DatasetNotRegistered(bytes32 datasetId);
    error InvalidDatasetHash();
    error InvalidCid();
    error UnauthorizedDatasetOwner();

    function registerDataset(
        bytes32 datasetId,
        bytes32 datasetHash,
        string calldata cid,
        string calldata metadataUri
    ) external {
        if (records[datasetId].registeredAt != 0) {
            revert DatasetAlreadyRegistered(datasetId);
        }
        if (datasetHash == bytes32(0)) {
            revert InvalidDatasetHash();
        }
        if (bytes(cid).length == 0) {
            revert InvalidCid();
        }

        records[datasetId] = DatasetRecord({
            owner: msg.sender,
            datasetHash: datasetHash,
            cid: cid,
            metadataUri: metadataUri,
            registeredAt: block.timestamp,
            active: true
        });
        ownerDatasets[msg.sender].push(datasetId);

        emit DatasetRegistered(datasetId, msg.sender, datasetHash, cid, metadataUri);
    }

    function deactivateDataset(bytes32 datasetId) external {
        DatasetRecord storage record = records[datasetId];
        if (record.registeredAt == 0) {
            revert DatasetNotRegistered(datasetId);
        }
        if (record.owner != msg.sender) {
            revert UnauthorizedDatasetOwner();
        }

        record.active = false;
        emit DatasetDeactivated(datasetId, msg.sender);
    }

    function verifyOwnership(bytes32 datasetId, address expectedOwner)
        external
        view
        returns (bool)
    {
        DatasetRecord storage record = records[datasetId];
        return record.active && record.owner == expectedOwner;
    }

    function getDataset(bytes32 datasetId)
        external
        view
        returns (DatasetRecord memory)
    {
        DatasetRecord storage record = records[datasetId];
        if (record.registeredAt == 0) {
            revert DatasetNotRegistered(datasetId);
        }

        return record;
    }

    function getOwnerDatasets(address owner) external view returns (bytes32[] memory) {
        return ownerDatasets[owner];
    }
}
