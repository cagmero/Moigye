import { GyeManagerABI } from "./abis/GyeManager";
import { BiddingEngineABI } from "./abis/BiddingEngine";
import { MoigyeVaultABI } from "./abis/MoigyeVault";
import { CONTRACT_ADDRESSES } from "./constants";


export const GYE_MANAGER_CONTRACT = {
    address: CONTRACT_ADDRESSES[102031].GYE_MANAGER as `0x${string}`,
    abi: GyeManagerABI,
};

export const BIDDING_ENGINE_CONTRACT = {
    address: CONTRACT_ADDRESSES[102031].BIDDING_ENGINE as `0x${string}`,
    abi: BiddingEngineABI,
};

export const MOIGYE_USD_ABI = [
    { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
    { inputs: [{ name: "spender", type: "address" }, { name: "value", type: "uint256" }], name: "approve", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
    { inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], name: "allowance", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
    { inputs: [], name: "decimals", outputs: [{ name: "", type: "uint8" }], stateMutability: "view", type: "function" },
    { inputs: [], name: "owner", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" },
    { inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], name: "mint", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

export const MOIGYE_USD_CONTRACT = {
    address: CONTRACT_ADDRESSES[102031].MOIGYE_USD as `0x${string}`,
    abi: MOIGYE_USD_ABI,
};

export const MOIGYE_VAULT_CONTRACT = {
    // Address filled after running: node --env-file=.env scripts/deploy_vault.mjs
    address: (CONTRACT_ADDRESSES[102031] as Record<string, string>).MOIGYE_VAULT as `0x${string}` ?? "0x0000000000000000000000000000000000000000",
    abi: MoigyeVaultABI,
};
