// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BiddingEngine
 * @dev Hub chain (Creditcoin) contract for Nak-chal-gye auction lifecycle.
 */
contract BiddingEngine is Ownable, ReentrancyGuard {
    enum Phase {
        Idle,
        Deposit,
        BiddingR1,
        Voting,
        FinalChallenge,
        Completed
    }

    struct GyeGroup {
        uint256 groupId;
        address[] members;
        uint256 monthlyContribution;
        uint256 biddingTimestamp;
        uint256 highestBid;
        address highestBidder;
        Phase phase;
        mapping(address => bool) hasDeposited;
        mapping(address => bool) hasWon;
        mapping(address => bool) satisfactionVotes;
        uint256 positiveVotes;
        uint256 votingEndTime;
    }

    mapping(uint256 => GyeGroup) public groups;

    event BidPlaced(
        uint256 indexed groupId,
        address indexed bidder,
        uint256 discountAmount
    );
    event PhaseTransition(uint256 indexed groupId, Phase newPhase);
    event WinnerSelected(
        uint256 indexed groupId,
        address indexed winner,
        uint256 payout,
        uint256 lockedBond,
        uint256 yieldPerMember
    );

    constructor() Ownable(msg.sender) {}

    modifier onlyGroupMember(uint256 groupId) {
        bool isMember = false;
        for (uint256 i = 0; i < groups[groupId].members.length; i++) {
            if (groups[groupId].members[i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        require(isMember, "Not a group member");
        _;
    }

    function createGyeGroup(
        uint256 groupId,
        address[] calldata members,
        uint256 monthlyContribution,
        uint256 biddingTimestamp
    ) external {
        // Restricted to GyeManager in production
        GyeGroup storage group = groups[groupId];
        group.groupId = groupId;
        group.members = members;
        group.monthlyContribution = monthlyContribution;
        group.biddingTimestamp = biddingTimestamp;
        group.phase = Phase.Idle;
    }

    function startDepositWindow(uint256 groupId) external {
        // require(
        //     block.timestamp >= groups[groupId].biddingTimestamp - 30 minutes,
        //     "Window not yet open"
        // );
        groups[groupId].phase = Phase.Deposit;
        emit PhaseTransition(groupId, Phase.Deposit);
    }

    function startRound1(uint256 groupId) external {
        require(
            groups[groupId].phase == Phase.Deposit,
            "Must be in deposit phase"
        );
        groups[groupId].phase = Phase.BiddingR1;
        emit PhaseTransition(groupId, Phase.BiddingR1);
    }

    function submitBid(
        uint256 groupId,
        uint256 discount
    ) external onlyGroupMember(groupId) nonReentrant {
        GyeGroup storage group = groups[groupId];
        require(
            group.phase == Phase.BiddingR1 ||
                group.phase == Phase.FinalChallenge,
            "Bidding not active"
        );
        require(!group.hasWon[msg.sender], "User already won a round");
        require(discount > group.highestBid, "Bid too low");

        group.highestBidder = msg.sender;
        group.highestBid = discount;

        emit BidPlaced(groupId, msg.sender, discount);
    }

    function endRound1(uint256 groupId) external {
        GyeGroup storage group = groups[groupId];
        require(group.phase == Phase.BiddingR1, "Not in Round 1");
        group.phase = Phase.Voting;
        group.votingEndTime = block.timestamp + 5 minutes;
        emit PhaseTransition(groupId, Phase.Voting);
    }

    function voteSatisfaction(
        uint256 groupId,
        bool isSatisfied
    ) external onlyGroupMember(groupId) {
        GyeGroup storage group = groups[groupId];
        require(group.phase == Phase.Voting, "Not in voting phase");
        require(block.timestamp <= group.votingEndTime, "Voting ended");

        group.satisfactionVotes[msg.sender] = isSatisfied;
        if (isSatisfied) group.positiveVotes++;

        // If all members voted or timeout
        if (group.positiveVotes == group.members.length) {
            _finalizeRound(groupId);
        }
    }

    function transitionAfterVoting(uint256 groupId) external {
        GyeGroup storage group = groups[groupId];
        require(group.phase == Phase.Voting, "Not in voting phase");
        require(block.timestamp > group.votingEndTime, "Wait for timeout");

        if (group.positiveVotes == group.members.length) {
            _finalizeRound(groupId);
        } else {
            group.phase = Phase.FinalChallenge;
            emit PhaseTransition(groupId, Phase.FinalChallenge);
        }
    }

    function finalizeFinalChallenge(uint256 groupId) external {
        require(
            groups[groupId].phase == Phase.FinalChallenge,
            "Not in challenge phase"
        );
        _finalizeRound(groupId);
    }

    function _finalizeRound(uint256 groupId) internal {
        GyeGroup storage group = groups[groupId];
        address winner = group.highestBidder;
        uint256 discount = group.highestBid;
        uint256 pot = group.members.length * group.monthlyContribution;

        uint256 totalPayout = pot - discount;
        uint256 payoutImmediate = (totalPayout * 70) / 100;
        uint256 lockedBond = totalPayout - payoutImmediate;

        group.hasWon[winner] = true;
        group.phase = Phase.Completed;

        uint256 yieldPerMember = discount / (group.members.length - 1);

        emit WinnerSelected(
            groupId,
            winner,
            payoutImmediate,
            lockedBond,
            yieldPerMember
        );
        emit PhaseTransition(groupId, Phase.Completed);
    }

    // Helper for frontend state tracking
    uint256 private highestBidValue;
}
