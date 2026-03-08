// scripts/redeploy_hub.mjs
// Deploys fresh BiddingEngine + GyeManager on CTC testnet, reuses existing ScoreManager
import { ethers } from "ethers";
import { readFileSync } from "fs";
import { createRequire } from "module";
import * as dotenv from "dotenv";
dotenv.config();

const require = createRequire(import.meta.url);

// ─── Config ────────────────────────────────────────────────────────────────
const RPC_URL = process.env.CTC_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
// Reuse the already-wired ScoreManager — don't redeploy it
const SCORE_MANAGER = process.env.SCORE_MANAGER_ADDRESS || "0xc4B94c1b7807bCd84cb84D523e83C709d4755aea";

if (!RPC_URL || !PRIVATE_KEY) {
    console.error("❌ Missing CTC_RPC_URL or PRIVATE_KEY in .env");
    process.exit(1);
}

// ─── Load compiled artifacts ────────────────────────────────────────────
const beArtifact = JSON.parse(readFileSync("./artifacts/contracts/BiddingEngine.sol/BiddingEngine.json", "utf8"));
const gymArtifact = JSON.parse(readFileSync("./artifacts/contracts/GyeManager.sol/GyeManager.json", "utf8"));

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const balance = await provider.getBalance(wallet.address);

    console.log("\n🔗  Chain ID :", (await provider.getNetwork()).chainId.toString());
    console.log("📍  Deployer :", wallet.address);
    console.log("💰  Balance  :", ethers.formatEther(balance), "tCTC\n");
    console.log("🔒  ScoreManager (reused):", SCORE_MANAGER, "\n");

    // ── 1. Deploy BiddingEngine ───────────────────────────────────────────
    console.log("📦  Deploying BiddingEngine...");
    const BeFactory = new ethers.ContractFactory(beArtifact.abi, beArtifact.bytecode, wallet);
    const biddingEngine = await BeFactory.deploy({ gasLimit: 3_000_000 });
    await biddingEngine.waitForDeployment();
    const beAddress = await biddingEngine.getAddress();
    console.log("✅  BiddingEngine deployed at :", beAddress);

    // ── 2. Deploy GyeManager(biddingEngine, scoreManager) ─────────────────
    console.log("\n📦  Deploying GyeManager...");
    const GymFactory = new ethers.ContractFactory(gymArtifact.abi, gymArtifact.bytecode, wallet);
    const gyeManager = await GymFactory.deploy(beAddress, SCORE_MANAGER, { gasLimit: 5_000_000 });
    await gyeManager.waitForDeployment();
    const gymAddress = await gyeManager.getAddress();
    console.log("✅  GyeManager deployed at    :", gymAddress);

    // ── 3. Verify wiring ──────────────────────────────────────────────────
    const storedBE = await gyeManager.biddingEngine();
    const storedSM = await gyeManager.scoreManager();
    console.log("\n🔎  GyeManager.biddingEngine() →", storedBE);
    console.log("🔎  GyeManager.scoreManager()  →", storedSM);

    const beOk = storedBE.toLowerCase() === beAddress.toLowerCase();
    const smOk = storedSM.toLowerCase() === SCORE_MANAGER.toLowerCase();
    console.log(beOk ? "✅  BiddingEngine wired correctly" : "❌  BiddingEngine mismatch!");
    console.log(smOk ? "✅  ScoreManager wired correctly" : "❌  ScoreManager mismatch!");

    // ── 4. Print what to update ───────────────────────────────────────────
    console.log("\n══════════════════════════════════════════════════════════════");
    console.log("📝  Update frontend/src/lib/constants.ts (chain 102031):");
    console.log(`    GYE_MANAGER:   "${gymAddress}",`);
    console.log(`    BIDDING_ENGINE:"${beAddress}",`);
    console.log("\n📝  Update frontend/.env.local:");
    console.log(`    GYE_MANAGER_ADDRESS=${gymAddress}`);
    console.log(`    BIDDING_ENGINE_ADDRESS=${beAddress}`);
    console.log("══════════════════════════════════════════════════════════════\n");
}

main().catch(err => { console.error("❌", err.message ?? err); process.exit(1); });
