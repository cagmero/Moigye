#!/usr/bin/env node
/**
 * Standalone deployment script for Moigye contracts.
 * Uses ethers.js directly with a JSON-RPC provider, bypassing Hardhat HRE plugin issues.
 * 
 * Usage: node scripts/deploy_standalone.mjs
 */
import { ethers } from "ethers";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ─── Config ────────────────────────────────────────────────────────────────
const RPC_URL = "https://rpc.cc3-testnet.creditcoin.network";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Existing addresses (already in README)
const BIDDING_ENGINE_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
const SCORE_MANAGER_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

if (!PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY env var is not set.");
    process.exit(1);
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function loadArtifact(contractName) {
    // Hardhat places artifacts at artifacts/contracts/<Name>.sol/<Name>.json
    const path = resolve(ROOT, "artifacts", "contracts", `${contractName}.sol`, `${contractName}.json`);
    return JSON.parse(readFileSync(path, "utf8"));
}

async function deployContract(signer, artifact, constructorArgs = [], label) {
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    console.log(`\n📦 Deploying ${label}...`);
    const contract = await factory.deploy(...constructorArgs);
    await contract.waitForDeployment();
    const addr = await contract.getAddress();
    console.log(`✅ ${label} deployed: ${addr}`);
    return { contract, addr };
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
    console.log("🚀 Moigye Standalone Deployment Script");
    console.log(`🌐 RPC: ${RPC_URL}`);

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    const { chainId } = await provider.getNetwork();
    const balance = ethers.formatEther(await provider.getBalance(signer.address));
    console.log(`📍 Deployer:  ${signer.address}`);
    console.log(`🔗 Chain ID:  ${chainId}`);
    console.log(`💰 Balance:   ${balance} CTC`);

    if (parseFloat(balance) < 0.01) {
        console.error("⚠️  Deployer balance may be too low. Proceeding anyway...");
    }

    // ── Deploy GyeStaking ──────────────────────────────────────────────────
    const stakingArt = loadArtifact("GyeStaking");
    const { addr: gyeStakingAddress } = await deployContract(signer, stakingArt, [], "GyeStaking");

    // ── Deploy GyeManager ──────────────────────────────────────────────────
    const managerArt = loadArtifact("GyeManager");
    const { addr: gyeManagerAddress } = await deployContract(
        signer,
        managerArt,
        [BIDDING_ENGINE_ADDRESS, SCORE_MANAGER_ADDRESS],
        "GyeManager"
    );

    // ─── Summary ───────────────────────────────────────────────────────────
    console.log("\n✨ Deployment Complete! Paste these into your README:");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`- **GyeStaking**: \`${gyeStakingAddress}\``);
    console.log(`- **GyeManager**: \`${gyeManagerAddress}\``);
    console.log("═══════════════════════════════════════════════════════");
}

main().catch((err) => {
    console.error("\n❌ Deployment failed:", err.message);
    process.exit(1);
});
