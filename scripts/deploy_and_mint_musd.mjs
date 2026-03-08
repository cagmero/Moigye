// scripts/deploy_and_mint_musd.mjs
// Deploys MoigyeUSD on CTC testnet and mints demo tokens to a target wallet
import { ethers } from "ethers";
import { readFileSync } from "fs";
import * as dotenv from "dotenv";
dotenv.config();

const TARGET_ADDRESS = "0xA72AE11555AA16aA602A8BD3C89006F75d7738F5";
const MINT_AMOUNT = "100000";   // 100,000 mUSD
const TOKEN_NAME = "MoigyeUSD";
const TOKEN_SYMBOL = "mUSD";
const TOKEN_DECIMALS = 6;

const RPC_URL = process.env.CTC_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!RPC_URL || !PRIVATE_KEY) {
    console.error("❌ Missing CTC_RPC_URL or PRIVATE_KEY in .env");
    process.exit(1);
}

const artifact = JSON.parse(
    readFileSync("./artifacts/contracts/MoigyeUSD.sol/MoigyeUSD.json", "utf8")
);

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const balance = await provider.getBalance(wallet.address);

    console.log(`\n🔗  Chain    : Creditcoin Testnet (${(await provider.getNetwork()).chainId})`);
    console.log(`📍  Deployer : ${wallet.address}`);
    console.log(`💰  Balance  : ${ethers.formatEther(balance)} tCTC\n`);

    // ── Deploy MoigyeUSD ────────────────────────────────────────────────────
    console.log(`📦  Deploying MoigyeUSD (${TOKEN_SYMBOL}, ${TOKEN_DECIMALS} decimals)...`);
    const Factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const musd = await Factory.deploy(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, { gasLimit: 2_000_000 });
    await musd.waitForDeployment();
    const musdAddr = await musd.getAddress();
    console.log(`✅  MoigyeUSD deployed at : ${musdAddr}`);

    // ── Mint to target ──────────────────────────────────────────────────────
    const amount = ethers.parseUnits(MINT_AMOUNT, TOKEN_DECIMALS);
    console.log(`\n🪙  Minting ${MINT_AMOUNT} ${TOKEN_SYMBOL} to ${TARGET_ADDRESS}...`);
    const tx = await musd.mint(TARGET_ADDRESS, amount, { gasLimit: 100_000 });
    console.log(`   Tx: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`   Confirmed in block ${receipt?.blockNumber} ✅`);

    const bal = await musd.balanceOf(TARGET_ADDRESS);
    console.log(`   Balance: ${ethers.formatUnits(bal, TOKEN_DECIMALS)} ${TOKEN_SYMBOL}`);

    // ── Mint to deployer too ────────────────────────────────────────────────
    const tx2 = await musd.mint(wallet.address, amount, { gasLimit: 100_000 });
    await tx2.wait();
    console.log(`   Also minted ${MINT_AMOUNT} ${TOKEN_SYMBOL} to deployer (${wallet.address})`);

    console.log(`\n══════════════════════════════════════════════════════════════`);
    console.log(`📝  Update .env and frontend/.env.local:`);
    console.log(`    MOIGYE_USD_ADDRESS=${musdAddr}`);
    console.log(`\n📝  Update frontend/src/lib/constants.ts (chain 102031):`);
    console.log(`    MOIGYE_USD: "${musdAddr}",   // CTC testnet (demo)`);
    console.log(`══════════════════════════════════════════════════════════════\n`);
}

main().catch(err => { console.error("❌", err.message ?? err); process.exit(1); });
