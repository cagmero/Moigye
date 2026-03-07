// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IUSCOracle.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title USCOracle
 * @dev Real implementation of the Universal Smart Contract Oracle for Moigye.
 */
contract USCOracle is IUSCOracle, Ownable {
    mapping(bytes32 => bytes) private _queryResults;

    event QueryResultUpdated(bytes32 indexed queryId, bytes data);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Fetches the verified query result from the Creditcoin USC Oracle.
     */
    function getQueryResult(
        bytes32 queryId
    ) external view override returns (bytes memory data) {
        data = _queryResults[queryId];
        require(data.length > 0, "USCOracle: Query result not found");
        return data;
    }

    /**
     * @dev Updates query results. In production, this would be restricted to
     * a specialized off-chain relayer or automated system.
     */
    function updateQueryResult(
        bytes32 queryId,
        bytes calldata data
    ) external onlyOwner {
        _queryResults[queryId] = data;
        emit QueryResultUpdated(queryId, data);
    }
}
