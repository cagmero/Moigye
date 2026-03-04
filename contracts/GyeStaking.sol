// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title GyeStaking
 * @dev Hub chain (Creditcoin) contract for ROSCA collateral.
 * Holds CTC stakes that get slashed on default.
 */
contract GyeStaking is Ownable {
    mapping(address => uint256) public stakedCTC;
    uint256 public totalStaked;

    event Staked(address indexed user, uint256 amount);
    event Slashed(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function stakeCTC(uint256 amount) external {
        // In reality, this would transfer CTC from the user
        stakedCTC[msg.sender] += amount;
        totalStaked += amount;
        emit Staked(msg.sender, amount);
    }

    function slashStake(address user, uint256 amount) external onlyOwner {
        require(stakedCTC[user] >= amount, "Insufficient stake to slash");
        stakedCTC[user] -= amount;
        totalStaked -= amount;
        emit Slashed(user, amount);
    }

    function unstake(uint256 amount) external {
        require(stakedCTC[msg.sender] >= amount, "Insufficient stake");
        stakedCTC[msg.sender] -= amount;
        totalStaked -= amount;
        emit Unstaked(msg.sender, amount);
    }
}
