// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "./interfaces/INativeQueryVerifier.sol";
import "./interfaces/EvmV1Decoder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GyeManager
 * @dev Hub chain (Creditcoin) contract for ROSCA state management.
 * Verifies cross-chain deposit proofs from Sepolia using 0x0FD2 precompile.
 */
contract GyeManager is Ownable {
    using NativeQueryVerifierLib for INativeQueryVerifier;

    struct PoolState {
        uint256 totalUsers;
        uint256 monthlyContribution;
        uint256 currentRound;
        uint256 totalValueLocked;
        bool isActive;
    }

    struct RoundInfo {
        address winner;
        uint256 potAmount;
        uint256 discount;
        bool settled;
    }

    PoolState public pool;
    mapping(uint256 => RoundInfo) public rounds;
    mapping(address => uint256) public userBalances;
    mapping(bytes32 => bool) public processedTransactions;

    event ContributionVerified(address indexed user, uint256 amount, uint256 roundId);
    event RoundSettled(uint256 indexed roundId, address indexed winner, uint256 payout);

    bytes32 public constant DEPOSIT_EVENT_SIG = keccak256("ContributionDeposited(address,uint256,uint256,uint256)");

    constructor(uint256 _monthlyContribution) Ownable(msg.sender) {
        pool.monthlyContribution = _monthlyContribution;
        pool.isActive = true;
    }

    /**
     * @notice Synchronously verifies a cross-chain deposit proof from Sepolia.
     * @param chainKey The chain ID of the source chain (Sepolia).
     * @param height The block height of the transaction.
     * @param encodedTransaction ABI-encoded transaction and receipt.
     * @param merkleProof Merkle proof for the transaction in the block.
     * @param continuityProof Continuity proof for the block's validity.
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

        // Use the native precompile at 0x0FD2
        INativeQueryVerifier verifier = NativeQueryVerifierLib.getVerifier();
        bool success = verifier.verifyAndEmit(
            chainKey,
            height,
            encodedTransaction,
            merkleProof,
            continuityProof
        );
        require(success, "Proof verification failed");

        // Decode receipt to find the event
        EvmV1Decoder.ReceiptFields memory receipt = EvmV1Decoder.decodeReceiptFields(encodedTransaction);
        EvmV1Decoder.LogEntry[] memory logs = EvmV1Decoder.getLogsByEventSignature(receipt, DEPOSIT_EVENT_SIG);
        
        require(logs.length > 0, "Deposit event not found");

        // Decode: ContributionDeposited(address user, uint256 amount, uint256 roundId, uint256 depositId)
        (address user, uint256 amount, uint256 roundId, ) = abi.decode(logs[0].data, (address, uint256, uint256, uint256));
        
        // Topic 1 is user (indexed)
        address indexedUser = address(uint160(uint256(logs[0].topics[1])));
        require(user == indexedUser, "User mismatch");

        processedTransactions[txHash] = true;
        userBalances[user] += amount;
        pool.totalValueLocked += amount;

        emit ContributionVerified(user, amount, roundId);
    }

    function setRoundWinner(uint256 roundId, address winner, uint256 potAmount, uint256 discount) external {
        // In a real scenario, this would be restricted to BiddingEngine or Multi-sig
        require(rounds[roundId].winner == address(0), "Round already has winner");
        rounds[roundId].winner = winner;
        rounds[roundId].potAmount = potAmount;
        rounds[roundId].discount = discount;
        rounds[roundId].settled = true;

        emit RoundSettled(roundId, winner, potAmount - discount);
    }
}
