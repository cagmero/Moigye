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
 * @dev Hub chain (Creditcoin) contract for ROSCA state management and Lobby system.
 */
contract GyeManager is Ownable {
    using NativeQueryVerifierLib for INativeQueryVerifier;

    struct GyeGroup {
        uint256 groupId;
        address moderator;
        address[] members;
        address[] pendingRequests;
        uint256 fixedDeposit;
        uint256 maxParticipants;
        uint256 biddingDate;
        bool isPublic;
        bool isActive;
        bool started;
    }

    struct GroupView {
        uint256 groupId;
        address moderator;
        uint256 currentParticipants;
        uint256 maxParticipants;
        uint256 fixedDeposit;
        uint256 totalPotAmount;
        uint256 biddingDate;
        bool isPublic;
    }

    IBiddingEngine public biddingEngine;
    uint256 public nextGroupId;
    mapping(uint256 => GyeGroup) public groups;
    mapping(bytes32 => bool) public processedTransactions;

    event GroupCreated(uint256 indexed groupId, address moderator, bool isPublic, uint256 deposit);
    event JoinRequest(uint256 indexed groupId, address indexed user);
    event MemberJoined(uint256 indexed groupId, address indexed user);
    event ContributionVerified(uint256 indexed groupId, address indexed user, uint256 amount);

    bytes32 public constant DEPOSIT_EVENT_SIG = keccak256("ContributionDeposited(address,uint256,uint256,uint256)");

    constructor(address _biddingEngine) Ownable(msg.sender) {
        biddingEngine = IBiddingEngine(_biddingEngine);
    }

    function createGroup(
        bool _isPublic,
        uint256 _fixedDeposit,
        uint256 _maxParticipants,
        uint256 _biddingDate
    ) external {
        uint256 groupId = nextGroupId++;
        GyeGroup storage group = groups[groupId];
        group.groupId = groupId;
        group.moderator = msg.sender;
        group.fixedDeposit = _fixedDeposit;
        group.maxParticipants = _maxParticipants;
        group.biddingDate = _biddingDate;
        group.isPublic = _isPublic;
        group.isActive = true;

        group.members.push(msg.sender);
        
        emit GroupCreated(groupId, msg.sender, _isPublic, _fixedDeposit);
        emit MemberJoined(groupId, msg.sender);
    }

    function joinPublicGroup(uint256 _groupId) external {
        GyeGroup storage group = groups[_groupId];
        require(group.isActive, "Group not active");
        require(group.isPublic, "Group is private");
        require(group.members.length < group.maxParticipants, "Group full");
        
        for (uint256 i = 0; i < group.members.length; i++) {
            require(group.members[i] != msg.sender, "Already a member");
        }

        group.members.push(msg.sender);
        emit MemberJoined(_groupId, msg.sender);
    }

    function requestJoin(uint256 _groupId) external {
        GyeGroup storage group = groups[_groupId];
        require(group.isActive, "Group not active");
        require(!group.isPublic, "Group is public");
        
        for (uint256 i = 0; i < group.members.length; i++) {
            require(group.members[i] != msg.sender, "Already a member");
        }
        for (uint256 i = 0; i < group.pendingRequests.length; i++) {
            require(group.pendingRequests[i] != msg.sender, "Request pending");
        }

        group.pendingRequests.push(msg.sender);
        emit JoinRequest(_groupId, msg.sender);
    }

    function approveRequest(uint256 _groupId, address _user) external {
        GyeGroup storage group = groups[_groupId];
        require(msg.sender == group.moderator, "Not moderator");
        require(group.members.length < group.maxParticipants, "Group full");

        bool found = false;
        for (uint256 i = 0; i < group.pendingRequests.length; i++) {
            if (group.pendingRequests[i] == _user) {
                group.pendingRequests[i] = group.pendingRequests[group.pendingRequests.length - 1];
                group.pendingRequests.pop();
                found = true;
                break;
            }
        }
        require(found, "Request not found");

        group.members.push(_user);
        emit MemberJoined(_groupId, _user);
    }

    function declineRequest(uint256 _groupId, address _user) external {
        GyeGroup storage group = groups[_groupId];
        require(msg.sender == group.moderator, "Not moderator");

        for (uint256 i = 0; i < group.pendingRequests.length; i++) {
            if (group.pendingRequests[i] == _user) {
                group.pendingRequests[i] = group.pendingRequests[group.pendingRequests.length - 1];
                group.pendingRequests.pop();
                break;
            }
        }
    }

    function startAuction(uint256 _groupId) external {
        GyeGroup storage group = groups[_groupId];
        require(msg.sender == group.moderator, "Not moderator");
        require(!group.started, "Already started");
        
        group.started = true;
        biddingEngine.createGyeGroup(_groupId, group.members, group.fixedDeposit, group.biddingDate);
    }

    function getAllPublicGroups() external view returns (GroupView[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextGroupId; i++) {
            if (groups[i].isActive && groups[i].isPublic) {
                count++;
            }
        }

        GroupView[] memory publicGroups = new GroupView[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextGroupId; i++) {
            if (groups[i].isActive && groups[i].isPublic) {
                GyeGroup storage g = groups[i];
                publicGroups[index] = GroupView({
                    groupId: g.groupId,
                    moderator: g.moderator,
                    currentParticipants: g.members.length,
                    maxParticipants: g.maxParticipants,
                    fixedDeposit: g.fixedDeposit,
                    totalPotAmount: g.members.length * g.fixedDeposit,
                    biddingDate: g.biddingDate,
                    isPublic: g.isPublic
                });
                index++;
            }
        }
        return publicGroups;
    }

    function getPendingRequests(uint256 _groupId) external view returns (address[] memory) {
        return groups[_groupId].pendingRequests;
    }

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

        (address user, uint256 amount, uint256 groupId, ) = abi.decode(logs[0].data, (address, uint256, uint256, uint256));
        
        address indexedUser = address(uint160(uint256(logs[0].topics[1])));
        require(user == indexedUser, "User mismatch");
        require(groups[groupId].isActive, "Group not active");

        processedTransactions[txHash] = true;
        emit ContributionVerified(groupId, user, amount);
    }
}


