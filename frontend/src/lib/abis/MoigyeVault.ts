export const MoigyeVaultABI = [
    // Events
    { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: false, name: "amount", type: "uint256" }, { indexed: false, name: "roundId", type: "uint256" }, { indexed: false, name: "depositId", type: "uint256" }], name: "ContributionDeposited", type: "event" },
    { anonymous: false, inputs: [{ indexed: true, name: "winner", type: "address" }, { indexed: false, name: "amountImmediate", type: "uint256" }, { indexed: false, name: "amountBond", type: "uint256" }, { indexed: false, name: "roundId", type: "uint256" }, { indexed: false, name: "nonce", type: "uint256" }], name: "PayoutExecuted", type: "event" },
    { anonymous: false, inputs: [{ indexed: true, name: "winner", type: "address" }, { indexed: false, name: "groupId", type: "uint256" }, { indexed: false, name: "amount", type: "uint256" }], name: "BondClaimed", type: "event" },
    // View functions
    { inputs: [], name: "usdc", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" },
    { inputs: [], name: "validator", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" },
    { inputs: [], name: "depositNonce", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
    { inputs: [{ name: "groupId", type: "uint256" }, { name: "user", type: "address" }], name: "lockedBonds", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
    // Write functions
    { inputs: [{ name: "amount", type: "uint256" }, { name: "roundId", type: "uint256" }], name: "depositContribution", outputs: [], stateMutability: "nonpayable", type: "function" },
    { inputs: [{ name: "groupId", type: "uint256" }], name: "claimBond", outputs: [], stateMutability: "nonpayable", type: "function" },
    { inputs: [{ name: "winner", type: "address" }, { name: "amount", type: "uint256" }, { name: "roundId", type: "uint256" }, { name: "nonce", type: "uint256" }, { name: "signature", type: "bytes" }], name: "executePayout", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;
