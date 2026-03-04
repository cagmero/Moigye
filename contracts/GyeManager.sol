// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "./interfaces/INativeQueryVerifier.sol";
import "./interfaces/EvmV1Decoder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IBiddingEngine {
    function createGyeGroup(
        uint256 groupId,
        address[] calldata members,
        uint256 monthlyContribution,
        uint256 biddingTimestamp
    ) external;
}

/**
 * @title GyeManager
 * @dev Hub chain (Creditcoin) contract for ROSCA state management.
 * Verifies cross-chain deposit proofs from Sepolia using 0x0FD2 precompile.
 */
contract GyeManager is Ownable {
    using NativeQueryVerifierLib for INativeQueryVerifier;

    struct GyeGroup {
        uint256 groupId;
        address[] members;
        uint256 monthlyContribution;
        uint256 biddingTimestamp;
        bool isActive;
    }

    IBiddingEngine public biddingEngine;
    uint256 public nextGroupId;
    mapping(uint256 => GyeGroup) public groups;
    mapping(bytes32 => bool) public processedTransactions;

    event GroupCreated(uint256 indexed groupId, address[] members, uint256 contribution, uint256 biddingTimestamp);
    event ContributionVerified(uint256 indexed groupId, address indexed user, uint256 amount);

    bytes32 public constant DEPOSIT_EVENT_SIG = keccak256("ContributionDeposited(address,uint256,uint256,uint256)");

    constructor(address _biddingEngine) Ownable(msg.sender) {
        biddingEngine = IBiddingEngine(_biddingEngine);
    }

    function createGyeGroup(
        address[] calldata members,
        uint256 monthlyContribution,
        uint256 biddingTimestamp
    ) external onlyOwner {
        uint256 groupId = nextGroupId++;
        groups[groupId] = GyeGroup({
            groupId: groupId,
            members: members,
            monthlyContribution: monthlyContribution,
            biddingTimestamp: biddingTimestamp,
            isActive: true
        });

        biddingEngine.createGyeGroup(groupId, members, monthlyContribution, biddingTimestamp);
        emit GroupCreated(groupId, members, monthlyContribution, biddingTimestamp);
    }

    /**
     * @notice Synchronously verifies a cross-chain deposit proof from Sepolia.
     */
    function verifyDeposit(
        uint64 chainKey,
        uint64 height,
        bytes calldata encodedTransaction,
        INativeQueryVerifier.MerkleProof calldata merkleProof,
        INativeQueryVerifier.ContinuityProof calldata continuityProof
    ) external {
        bytes32 txHash = keccak256(encodedTransaction);
        require(!processedTransactions[txHash], "Transaction already processed");

        INativeQueryVerifier verifier = NativeQueryVerifierLib.getVerifier();
        bool success = verifier.verifyAndEmit(
            chainKey,
            height,
            encodedTransaction,
            merkleProof,
            continuityProof
        );
        require(success, "Proof verification failed");

        EvmV1Decoder.ReceiptFields memory receipt = EvmV1Decoder.decodeReceiptFields(encodedTransaction);
        EvmV1Decoder.LogEntry[] memory logs = EvmV1Decoder.getLogsByEventSignature(receipt, DEPOSIT_EVENT_SIG);
        
        require(logs.length > 0, "Deposit event not found");

        // Decode: ContributionDeposited(address user, uint256 amount, uint256 roundId, uint256 depositId)
        (address user, uint256 amount, uint256 groupId, ) = abi.decode(logs[0].data, (address, uint256, uint256, uint256));
        
        address indexedUser = address(uint160(uint256(logs[0].topics[1])));
        require(user == indexedUser, "User mismatch");
        require(groups[groupId].isActive, "Group not active");

        processedTransactions[txHash] = true;
        emit ContributionVerified(groupId, user, amount);
    }
}

