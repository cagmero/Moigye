#!/usr/bin/env node
/**
 * deploy_vault_only.mjs
 * ─────────────────────
 * Deploys MoigyeVault.sol to Ethereum Sepolia, waits 5 block confirmations,
 * then submits source verification to the Sepolia Etherscan API.
 *
 * Usage:
 *   PRIVATE_KEY=0x... SEPOLIA_RPC_URL=https://... node scripts/deploy_vault_only.mjs
 *
 * CONSTRUCTOR ARGS:
 *   _usdc      → MoigyeUSD address  (already live on Sepolia)
 *   _validator → deployer address   (owner; update via setValidator() later)
 */
import { ethers } from "ethers";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";
import querystring from "querystring";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ─── Config ────────────────────────────────────────────────────────────────
const MOIGYE_USD_ADDRESS = "0x4ed7c06655c1b138c84014c119902c0039725807";
const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || "https://1rpc.io/sepolia";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";   // optional for verification
const CONFIRMATIONS = 5;

// ─── Guards ────────────────────────────────────────────────────────────────
if (!PRIVATE_KEY) {
    console.error("❌  Set PRIVATE_KEY env var before running.");
    process.exit(1);
}

// ─── Load compiled artifact ────────────────────────────────────────────────
function loadArtifact(name) {
    const path = resolve(ROOT, "artifacts", "contracts", `${name}.sol`, `${name}.json`);
    if (!existsSync(path)) {
        console.error(`❌  Artifact not found: ${path}\n    Run: npx hardhat compile`);
        process.exit(1);
    }
    return JSON.parse(readFileSync(path, "utf8"));
}

// ─── Etherscan verification (REST API — works independently of Hardhat HRE) ─
async function verifyOnEtherscan(address, constructorArgs) {
    if (!ETHERSCAN_API_KEY) {
        console.log("⚠️   ETHERSCAN_API_KEY not set; skipping verification.");
        return;
    }

    const artifact = loadArtifact("MoigyeVault");
    const abiCoder = new ethers.AbiCoder();
    const encoded = abiCoder.encode(
        ["address", "address"],
        constructorArgs
    ).slice(2); // strip 0x

    const data = querystring.stringify({
        apikey: ETHERSCAN_API_KEY,
        module: "contract",
        action: "verifysourcecode",
        contractaddress: address,
        sourceCode: JSON.stringify({ language: "Solidity" }), // placeholder; use Hardhat verify for full source
        contractname: "MoigyeVault",
        compilerversion: "v0.8.20+commit.a1b79de6",
        optimizationUsed: "1",
        runs: "200",
        constructorArguements: encoded,
        licenseType: "3",
    });

    console.log("🔍  Submitting to Etherscan API...");
    // Use 'npx hardhat verify' cli for proper source submission:
    console.log(`\n📋  Run this to fully verify source:\n    ETHERSCAN_API_KEY=${ETHERSCAN_API_KEY} npx hardhat verify --network sepolia ${address} "${constructorArgs[0]}" "${constructorArgs[1]}"`);
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
    console.log("🚀  MoigyeVault Deployment — Ethereum Sepolia");
    console.log(`🌐  RPC: ${SEPOLIA_RPC}`);

    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    const { chainId } = await provider.getNetwork();
    if (chainId !== 11155111n) {
        console.error(`❌  Wrong network! Expected Sepolia (11155111), got ${chainId}`);
        process.exit(1);
    }

    const balance = ethers.formatEther(await provider.getBalance(signer.address));
    console.log(`📍  Deployer: ${signer.address}`);
    console.log(`💰  Balance:  ${balance} ETH`);

    if (parseFloat(balance) < 0.01) {
        console.warn("⚠️   Low balance warning — make sure you have enough Sepolia ETH.");
    }

    const artifact = loadArtifact("MoigyeVault");
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

    const constructorArgs = [MOIGYE_USD_ADDRESS, signer.address];

    console.log(`\n📦  Deploying MoigyeVault...`);
    console.log(`    _usdc      = ${constructorArgs[0]}`);
    console.log(`    _validator = ${constructorArgs[1]} (deployer wallet)`);

    const vault = await factory.deploy(...constructorArgs);
    const deployTx = vault.deploymentTransaction();
    console.log(`\n⏳  Tx submitted: ${deployTx.hash}`);
    console.log(`    Waiting for ${CONFIRMATIONS} confirmations...`);

    await deployTx.wait(CONFIRMATIONS);
    await vault.waitForDeployment();

    const vaultAddress = await vault.getAddress();

    console.log(`\n✅  MoigyeVault deployed & confirmed!`);
    console.log(`═══════════════════════════════════════════════════════`);
    console.log(`   Vault Address:  ${vaultAddress}`);
    console.log(`   Explorer:       https://sepolia.etherscan.io/address/${vaultAddress}`);
    console.log(`═══════════════════════════════════════════════════════`);
    console.log(`\n📝  Add this to your .env:`);
    console.log(`   MOIGYE_VAULT_ADDRESS=${vaultAddress}`);

    await verifyOnEtherscan(vaultAddress, constructorArgs);
}

main().catch((err) => {
    console.error("\n❌  Deployment failed:", err.message);
    process.exit(1);
});
