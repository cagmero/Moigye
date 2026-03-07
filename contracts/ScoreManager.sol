// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./MoigyeSBT.sol";

/**
 * @title ScoreManager
 * @dev Manages user credit scores and non-transferable credit records for the Moigye protocol.
 */
contract ScoreManager is ERC721, Ownable {
    uint256 public constant DEFAULT_SCORE = 300;
    uint256 private _nextTokenId;
    address public gyeManager;
    MoigyeSBT public reputationSBT;

    mapping(address => uint256) public creditScores;

    event ScoreUpdated(address indexed user, uint256 newScore);
    event CreditRecordMinted(address indexed user, uint256 tokenId);

    modifier onlyGyeManager() {
        require(
            msg.sender == gyeManager || msg.sender == owner(),
            "Caller is not authorized"
        );
        _;
    }

    constructor() ERC721("Moigye Credit Record", "MCR") Ownable(msg.sender) {
        gyeManager = msg.sender; // Default to owner, can be updated later
    }

    /**
     * @dev Set the GyeManager address that can update scores and mint NFTs.
     */
    function setGyeManager(address _gyeManager) external onlyOwner {
        gyeManager = _gyeManager;
    }

    /**
     * @dev Set the MoigyeSBT address.
     */
    function setReputationSBT(address _reputationSBT) external onlyOwner {
        reputationSBT = MoigyeSBT(_reputationSBT);
    }

    /**
     * @dev Returns the credit score of a user. Returns DEFAULT_SCORE if not records exist.
     */
    function getScore(address user) public view returns (uint256) {
        uint256 score = creditScores[user];
        if (score == 0) return DEFAULT_SCORE;
        return score;
    }

    /**
     * @dev Increases user score by 10 for successful round participation.
     */
    function recordSuccessfulPayment(address user) external onlyGyeManager {
        uint256 current = getScore(user);
        creditScores[user] = current + 10;
        emit ScoreUpdated(user, creditScores[user]);
    }

    /**
     * @dev Slashes user score by 150 for defaulting and marks them in the SBT.
     */
    function recordDefault(address user) external onlyGyeManager {
        uint256 current = getScore(user);
        if (current > 150) {
            creditScores[user] = current - 150;
        } else {
            creditScores[user] = 0;
        }

        if (address(reputationSBT) != address(0)) {
            reputationSBT.markDefaulted(user);
        }

        emit ScoreUpdated(user, creditScores[user]);
    }

    /**
     * @dev Marks a user as trusted in the SBT system.
     */
    function recordTrusted(address user) external onlyGyeManager {
        if (address(reputationSBT) != address(0)) {
            reputationSBT.markTrusted(user);
        }
    }

    /**
     * @dev Mints a non-transferable credit record NFT for the user.
     */
    function mintCreditRecord(address user) external onlyGyeManager {
        uint256 tokenId = _nextTokenId++;
        _safeMint(user, tokenId);

        if (address(reputationSBT) != address(0)) {
            try reputationSBT.mintStatus(user) {} catch {}
        }

        emit CreditRecordMinted(user, tokenId);
    }

    /**
     * @dev Overridden to prevent transfers, making the NFT soulbound.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("MCR: Token is non-transferable");
        }
        return super._update(to, tokenId, auth);
    }
}
