// scripts/deploy_vault.mjs
// Deploys MoigyeVault on CTC testnet, wired to the new mUSD token
import { ethers } from "ethers";
import { readFileSync } from "fs";
import * as dotenv from "dotenv";
dotenv.config();

const MOIGYE_USD_ADDRESS = process.env.MOIGYE_USD_ADDRESS || "0xb6414BD71C42290892DadcEb4616d8A09628c0cf";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CTC_RPC_URL = process.env.CTC_RPC_URL;

if (!PRIVATE_KEY || !CTC_RPC_URL) {
    console.error("❌ Missing PRIVATE_KEY or CTC_RPC_URL in .env");
    process.exit(1);
}

const artifact = JSON.parse(
    readFileSync("./artifacts/contracts/MoigyeVault.sol/MoigyeVault.json", "utf8")
);

async function main() {
    const provider = new ethers.JsonRpcProvider(CTC_RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const balance = await provider.getBalance(wallet.address);

    console.log(`\n🔗  Chain    : Creditcoin Testnet (${(await provider.getNetwork()).chainId})`);
    console.log(`📍  Deployer : ${wallet.address}`);
    console.log(`💰  Balance  : ${ethers.formatEther(balance)} tCTC`);
    console.log(`🪙  mUSD     : ${MOIGYE_USD_ADDRESS}\n`);

    // Validator = deployer (for demo: deployer signs payouts)
    const VALIDATOR = wallet.address;

    console.log(`📦  Deploying MoigyeVault(usdc=${MOIGYE_USD_ADDRESS}, validator=${VALIDATOR})...`);
    const Factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const vault = await Factory.deploy(MOIGYE_USD_ADDRESS, VALIDATOR, { gasLimit: 3_500_000 });
    await vault.waitForDeployment();
    const vaultAddr = await vault.getAddress();
    console.log(`✅  MoigyeVault deployed at : ${vaultAddr}`);

    console.log(`\n══════════════════════════════════════════════════════════════`);
    console.log(`📝  Update .env and frontend/.env.local:`);
    console.log(`    MOIGYE_VAULT_ADDRESS=${vaultAddr}`);
    console.log(`\n📝  Update frontend/src/lib/constants.ts (chain 102031):`);
    console.log(`    MOIGYE_VAULT: "${vaultAddr}",`);
    console.log(`══════════════════════════════════════════════════════════════\n`);
}

main().catch(err => { console.error("❌", err.message ?? err); process.exit(1); });
