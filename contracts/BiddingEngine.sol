// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BiddingEngine
 * @dev Hub chain (Creditcoin) contract for ROSCA bidding logic.
 * Implements blind discount bidding where the highest bidder wins the pot.
 */
contract BiddingEngine is Ownable, ReentrancyGuard {
    struct Bid {
        uint256 discount;
        bool exists;
    }

    struct RoundBids {
        mapping(address => Bid) bids;
        address[] bidders;
        address winner;
        uint256 maxDiscount;
        bool isRevealed;
    }

    uint256 public constant TOTAL_USERS = 10; // Example fixed size
    uint256 public constant MONTHLY_CONTRIBUTION = 100 * 1e6; // 100 USDC (6 decimals)
    uint256 public currentRoundId;

    mapping(uint256 => RoundBids) private roundBids;
    mapping(address => bool) public hasWon;

    event BidSubmitted(address indexed bidder, uint256 roundId);
    event WinnerSelected(uint256 indexed roundId, address indexed winner, uint256 discount, uint256 payout);

    constructor() Ownable(msg.sender) {}

    function submitBid(uint256 discount) external nonReentrant {
        require(!hasWon[msg.sender], "User already won a round");
        require(!roundBids[currentRoundId].bids[msg.sender].exists, "Bid already submitted");
        
        roundBids[currentRoundId].bids[msg.sender] = Bid(discount, true);
        roundBids[currentRoundId].bidders.push(msg.sender);

        emit BidSubmitted(msg.sender, currentRoundId);
    }

    function selectWinner() external onlyOwner {
        RoundBids storage round = roundBids[currentRoundId];
        require(round.bidders.length > 0, "No bidders");
        require(round.winner == address(0), "Winner already selected");

        address winner = address(0);
        uint256 maxDiscount = 0;

        for (uint256 i = 0; i < round.bidders.length; i++) {
            address bidder = round.bidders[i];
            if (round.bids[bidder].discount > maxDiscount) {
                maxDiscount = round.bids[bidder].discount;
                winner = bidder;
            }
        }

        // If multiple same bids, first one wins for simplicity in this hackathon
        require(winner != address(0), "Winner selection failed");

        round.winner = winner;
        round.maxDiscount = maxDiscount;
        hasWon[winner] = true;

        uint256 pot = TOTAL_USERS * MONTHLY_CONTRIBUTION;
        uint256 payout = pot - maxDiscount;
        // The maxDiscount is implicitly "distributed" as everyone else paid less or 
        // in this simplified model, the winner just takes less and the difference 
        // stays in the vault for future yield/distribution.
        
        emit WinnerSelected(currentRoundId, winner, maxDiscount, payout);
        currentRoundId++;
    }

    function getRoundWinner(uint256 roundId) external view returns (address, uint256) {
        return (roundBids[roundId].winner, roundBids[roundId].maxDiscount);
    }
}
