#!/usr/bin/env node
/**
 * Diagnostic script: checks the on-chain state of GyeManager and ScoreManager
 * Run: node scripts/check_gye_state.mjs
 */
import { ethers } from "ethers";

const RPC_URL = "https://rpc.cc3-testnet.creditcoin.network";

const GYE_MANAGER_ADDRESS = "0xC6AF175200807DeE213f58D4C375a574284ba2f0";
const SCORE_MANAGER_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

const GYE_MANAGER_ABI = [
    "function scoreManager() view returns (address)",
    "function biddingEngine() view returns (address)",
    "function nextGroupId() view returns (uint256)",
    "function owner() view returns (address)",
];

const SCORE_MANAGER_ABI = [
    "function gyeManager() view returns (address)",
    "function owner() view returns (address)",
    "function getScore(address user) view returns (uint256)",
    "function DEFAULT_SCORE() view returns (uint256)",
];

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const { chainId } = await provider.getNetwork();
    console.log(`\n🔗 Connected to Chain ID: ${chainId}`);

    // — GyeManager checks —
    console.log(`\n📋 Checking GyeManager at ${GYE_MANAGER_ADDRESS}...`);
    const gyeManager = new ethers.Contract(GYE_MANAGER_ADDRESS, GYE_MANAGER_ABI, provider);
    try {
        const [scoreManagerAddr, biddingEngineAddr, nextGroupId, gyeOwner] = await Promise.all([
            gyeManager.scoreManager(),
            gyeManager.biddingEngine(),
            gyeManager.nextGroupId(),
            gyeManager.owner(),
        ]);
        console.log(`  scoreManager:   ${scoreManagerAddr}`);
        console.log(`  biddingEngine:  ${biddingEngineAddr}`);
        console.log(`  nextGroupId:    ${nextGroupId}`);
        console.log(`  owner:          ${gyeOwner}`);

        const scoreManagerOk = scoreManagerAddr.toLowerCase() === SCORE_MANAGER_ADDRESS.toLowerCase();
        console.log(`  scoreManager correct? ${scoreManagerOk ? "✅ YES" : "❌ NO — MISMATCH!"}`);
    } catch (e) {
        console.error("  ❌ Error reading GyeManager:", e.message);
    }

    // — ScoreManager checks —
    console.log(`\n📋 Checking ScoreManager at ${SCORE_MANAGER_ADDRESS}...`);
    const scoreManager = new ethers.Contract(SCORE_MANAGER_ADDRESS, SCORE_MANAGER_ABI, provider);
    try {
        const [gyeManagerAddr, scoreOwner, defaultScore] = await Promise.all([
            scoreManager.gyeManager(),
            scoreManager.owner(),
            scoreManager.DEFAULT_SCORE(),
        ]);
        console.log(`  gyeManager:     ${gyeManagerAddr}`);
        console.log(`  owner:          ${scoreOwner}`);
        console.log(`  DEFAULT_SCORE:  ${defaultScore}`);

        const gyeManagerOk = gyeManagerAddr.toLowerCase() === GYE_MANAGER_ADDRESS.toLowerCase();
        console.log(`  gyeManager correct? ${gyeManagerOk ? "✅ YES" : "❌ NO — MISMATCH!"}`);
    } catch (e) {
        console.error("  ❌ Error reading ScoreManager:", e.message);
    }

    // — Test getScore for zero address (should return 300) —
    console.log(`\n📊 Testing getScore(0x0)...`);
    try {
        const score = await scoreManager.getScore("0x0000000000000000000000000000000000000001");
        console.log(`  Score for 0x1: ${score} (expected 300)`);
    } catch (e) {
        console.error("  ❌ getScore failed:", e.message);
    }

    console.log("\n✅ Diagnostic complete.");
}

main().catch(console.error);
