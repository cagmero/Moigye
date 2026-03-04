// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title MoigyeVault
 * @dev Spoke chain (Ethereum Sepolia) contract.
 * Custody contract for USDC deposits and payouts.
 * Funds are managed by the Chainlink CRE yield agent.
 */
contract MoigyeVault is ReentrancyGuard, Ownable, EIP712 {
    using SafeERC20 for IERC20;

    address public validator;
    address public usdc;
    mapping(bytes32 => bool) public payoutProcessed;
    uint256 public depositNonce;

    bytes32 public constant PAYOUT_TYPEHASH = keccak256(
        "Payout(address winner,uint256 amount,uint256 roundId,uint256 nonce)"
    );

    event ContributionDeposited(address indexed user, uint256 amount, uint256 roundId, uint256 depositId);
    event PayoutExecuted(address indexed winner, uint256 amount, uint256 roundId, uint256 nonce);
    event ValidatorUpdated(address indexed newValidator);
    event YieldOptimized(address indexed target, uint256 amount);

    constructor(address _usdc, address _validator) Ownable(msg.sender) EIP712("Moigye_Vault", "1.0.0") {
        usdc = _usdc;
        validator = _validator;
    }

    function setValidator(address _validator) external onlyOwner {
        validator = _validator;
        emit ValidatorUpdated(_validator);
    }

    function depositContribution(uint256 amount, uint256 roundId) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        IERC20(usdc).safeTransferFrom(msg.sender, address(this), amount);

        uint256 depositId = depositNonce++;
        emit ContributionDeposited(msg.sender, amount, roundId, depositId);
    }

    /**
     * @dev Executes payout on spoke chain using a signature from the Hub validator.
     */
    function executePayout(
        address winner,
        uint256 amount,
        uint256 roundId,
        uint256 nonce,
        bytes calldata signature
    ) external nonReentrant {
        bytes32 payoutId = keccak256(abi.encodePacked(winner, amount, roundId, nonce));
        require(!payoutProcessed[payoutId], "Payout already processed");

        bytes32 structHash = keccak256(abi.encode(PAYOUT_TYPEHASH, winner, amount, roundId, nonce));
        bytes32 digest = _hashTypedDataV4(structHash);
        
        address recoveredAddress = ECDSA.recover(digest, signature);
        require(recoveredAddress == validator, "Invalid validator signature");

        payoutProcessed[payoutId] = true;
        IERC20(usdc).safeTransfer(winner, amount);

        emit PayoutExecuted(winner, amount, roundId, nonce);
    }

    /**
     * @dev Yield Optimization (Targeted for Chainlink CRE)
     * Allows the CRE agent (owner/authorized) to move idle funds to yield pools.
     */
    function optimizeYield(address target, uint256 amount) external onlyOwner {
        IERC20(usdc).safeTransfer(target, amount);
        emit YieldOptimized(target, amount);
    }

    // Emergency withdraw for owner
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        IERC20(usdc).safeTransfer(msg.sender, amount);
    }
}
