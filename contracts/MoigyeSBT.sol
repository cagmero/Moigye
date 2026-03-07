// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MoigyeSBT
 * @dev Soulbound Token (SBT) for Moigye protocol reputation.
 * Tokens are non-transferable and represent the user's standing (Active, Trusted, Defaulted).
 */
contract MoigyeSBT is ERC721, Ownable {
    enum Status {
        Active,
        Trusted,
        Defaulted
    }

    mapping(uint256 => Status) public tokenStatus;
    mapping(address => uint256) public userTokenId;
    uint256 private _nextTokenId = 1;

    address public authorizedManager;

    event StatusUpdated(
        address indexed user,
        uint256 indexed tokenId,
        Status status
    );

    modifier onlyAuthorized() {
        require(
            msg.sender == authorizedManager || msg.sender == owner(),
            "SBT: Not authorized"
        );
        _;
    }

    constructor() ERC721("Moigye Reputation SBT", "MSBT") Ownable(msg.sender) {}

    function setAuthorizedManager(address _manager) external onlyOwner {
        authorizedManager = _manager;
    }

    /**
     * @dev Mints a reputation SBT for a user. Each user can only have one token.
     */
    function mintStatus(address to) external onlyAuthorized returns (uint256) {
        require(userTokenId[to] == 0, "SBT: User already has a token");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        userTokenId[to] = tokenId;
        tokenStatus[tokenId] = Status.Active;
        emit StatusUpdated(to, tokenId, Status.Active);
        return tokenId;
    }

    function markTrusted(address user) external onlyAuthorized {
        uint256 tokenId = userTokenId[user];
        require(tokenId != 0, "SBT: User has no token");
        tokenStatus[tokenId] = Status.Trusted;
        emit StatusUpdated(user, tokenId, Status.Trusted);
    }

    function markDefaulted(address user) external onlyAuthorized {
        uint256 tokenId = userTokenId[user];
        require(tokenId != 0, "SBT: User has no token");
        tokenStatus[tokenId] = Status.Defaulted;
        emit StatusUpdated(user, tokenId, Status.Defaulted);
    }

    function getStatus(address user) external view returns (Status) {
        uint256 tokenId = userTokenId[user];
        if (tokenId == 0) return Status.Active; // Default for users without token
        return tokenStatus[tokenId];
    }

    /**
     * @dev Core Soulbound logic: tokens cannot be transferred.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("SBT: Non-transferable");
        }
        return super._update(to, tokenId, auth);
    }
}
