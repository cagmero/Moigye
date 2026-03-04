// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ScoreManager
 * @dev Manages user credit scores for the Moigye protocol.
 * Residents gain points for on-time contributions and lose points for defaults.
 */
contract ScoreManager is Ownable {
    uint256 public constant MIN_SCORE = 300;
    uint256 public constant MAX_SCORE = 850;
    
    // Exact specifications: +10 for completed rounds, -100 for defaults
    int256 public constant ROUND_COMPLETION_BONUS = 10;
    int256 public constant DEFAULT_PENALTY = -100;

    mapping(address => uint256) public scores;

    event ScoreUpdated(address indexed user, uint256 newScore, string reason);

    constructor() Ownable(msg.sender) {}

    function getScore(address user) public view returns (uint256) {
        uint256 score = scores[user];
        if (score == 0) return 600; // Default starting score for ROSCA
        return score;
    }

    function recordRoundCompletion(address user) external onlyOwner {
        updateScore(user, ROUND_COMPLETION_BONUS, "Round Completed");
    }

    function recordDefault(address user) external onlyOwner {
        updateScore(user, DEFAULT_PENALTY, "Defaulted");
    }

    function updateScore(address user, int256 delta, string memory reason) public onlyOwner {
        uint256 current = getScore(user);
        int256 newScore = int256(current) + delta;

        if (newScore < int256(MIN_SCORE)) newScore = int256(MIN_SCORE);
        if (newScore > int256(MAX_SCORE)) newScore = int256(MAX_SCORE);

        scores[user] = uint256(newScore);
        emit ScoreUpdated(user, uint256(newScore), reason);
    }
}
