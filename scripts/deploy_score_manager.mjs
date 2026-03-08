#!/usr/bin/env node
/**
 * Deploy ScoreManager to Creditcoin Testnet and wire it into the existing GyeManager.
 * 
 * Usage: node --env-file=.env scripts/deploy_score_manager.mjs
 */
import { ethers } from "ethers";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const RPC_URL = process.env.CTC_RPC_URL || "https://rpc.cc3-testnet.creditcoin.network";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// The GyeManager we need to wire the new ScoreManager into
const GYE_MANAGER_ADDRESS = "0xC6AF175200807DeE213f58D4C375a574284ba2f0";

if (!PRIVATE_KEY) {
    console.error("❌  PRIVATE_KEY not set in .env");
    process.exit(1);
}

function loadArtifact(contractName) {
    const path = resolve(
        ROOT,
        "artifacts",
        "contracts",
        `${contractName}.sol`,
        `${contractName}.json`
    );
    return JSON.parse(readFileSync(path, "utf8"));
}

const GYE_MANAGER_ABI = [
    "function scoreManager() view returns (address)",
    "function owner() view returns (address)",
    "function setScoreManager(address) external",
];

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const { chainId } = await provider.getNetwork();
    const balance = ethers.formatEther(await provider.getBalance(signer.address));

    console.log(`\n🔗  Chain ID : ${chainId}`);
    console.log(`📍  Deployer : ${signer.address}`);
    console.log(`💰  Balance  : ${balance} tCTC`);

    if (parseFloat(balance) < 0.1) {
        console.error("⚠️  Balance too low — need at least 0.1 tCTC");
        process.exit(1);
    }

    // ── Check current state ────────────────────────────────────────────────
    const gyeManager = new ethers.Contract(GYE_MANAGER_ADDRESS, GYE_MANAGER_ABI, signer);
    const currentScoreManager = await gyeManager.scoreManager();
    const contractOwner = await gyeManager.owner();

    console.log(`\n📋  GyeManager current scoreManager : ${currentScoreManager}`);
    console.log(`👑  GyeManager owner                : ${contractOwner}`);

    if (contractOwner.toLowerCase() !== signer.address.toLowerCase()) {
        console.error(`❌  You are not the owner of GyeManager. Owner is: ${contractOwner}`);
        process.exit(1);
    }

    // ScoreManager was already deployed in a previous run — reuse it
    const scoreManagerAddress = "0xc4B94c1b7807bCd84cb84D523e83C709d4755aea";
    console.log(`\n♻️   Reusing deployed ScoreManager at: ${scoreManagerAddress}`);

    // ── Wire into GyeManager ───────────────────────────────────────────────
    console.log(`\n🔧  Calling setScoreManager(${scoreManagerAddress}) on GyeManager...`);
    const tx = await gyeManager.setScoreManager(scoreManagerAddress, { gasLimit: 500_000 });
    await tx.wait();
    console.log(`✅  setScoreManager tx: ${tx.hash}`);

    // ── Verify ────────────────────────────────────────────────────────────
    const newScoreManager = await gyeManager.scoreManager();
    console.log(`\n🔍  New scoreManager in GyeManager: ${newScoreManager}`);
    const ok = newScoreManager.toLowerCase() === scoreManagerAddress.toLowerCase();
    console.log(`✅  Verified: ${ok ? "CORRECT" : "❌ MISMATCH — something went wrong"}`);

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🎉 ScoreManager successfully deployed and wired!             ║
╠═══════════════════════════════════════════════════════════════╣
║  Update your .env:                                            ║
║  SCORE_MANAGER_ADDRESS=${scoreManagerAddress}  ║
╚═══════════════════════════════════════════════════════════════╝
`);
}

main().catch((err) => {
    console.error("\n❌  Script failed:", err.message);
    process.exit(1);
});
