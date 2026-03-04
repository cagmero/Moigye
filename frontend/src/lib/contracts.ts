import { GyeManagerABI } from "./abis/GyeManager";
import { BiddingEngineABI } from "./abis/BiddingEngine";
import { CONTRACT_ADDRESSES } from "./constants";

export const GYE_MANAGER_CONTRACT = {
    address: CONTRACT_ADDRESSES[102031].GYE_MANAGER as `0x${string}`,
    abi: GyeManagerABI,
};

export const BIDDING_ENGINE_CONTRACT = {
    address: CONTRACT_ADDRESSES[102031].BIDDING_ENGINE as `0x${string}`,
    abi: BiddingEngineABI,
};
