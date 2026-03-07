// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MoigyeUSD
 * @dev Production-ready stablecoin mockup for the Moigye protocol.
 */
contract MoigyeUSD is ERC20, Ownable {
    uint8 private _customDecimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _customDecimals = decimals_;
    }

    /**
     * @dev Minting function for administrative setup and testing.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Override decimals for consistency across chains.
     */
    function decimals() public view virtual override returns (uint8) {
        return _customDecimals;
    }
}
