import hre from "hardhat";
import fs from "fs";
import path from "path";

// GyeManager on CTC testnet
const GYE_MANAGER_ADDRESS = "0xC6AF175200807DeE213f58D4C375a574284ba2f0";

const SET_BIDDING_ENGINE_ABI = [
    "function biddingEngine() view returns (address)",
    "function owner() view returns (address)",
    "function setBiddingEngine(address _biddingEngine) external",
];

// If GyeManager doesn't have setBiddingEngine, we'll note it and the user will need to redeploy
const GYE_MANAGER_FULL_ABI = [
    "function biddingEngine() view returns (address)",
    "function owner() view returns (address)",
];

async function main() {
    const [signer] = await hre.ethers.getSigners();
    console.log(`\n📍 Signer: ${signer.address}`);

    // 1. Check current biddingEngine on GyeManager
    const gyeManager = await hre.ethers.getContractAt(GYE_MANAGER_FULL_ABI, GYE_MANAGER_ADDRESS, signer);
    const currentBE = await gyeManager.biddingEngine();
    console.log(`\n📋 Current biddingEngine in GyeManager: ${currentBE}`);

    // 2. Deploy BiddingEngine
    console.log(`\n📦 Deploying BiddingEngine to CTC testnet...`);
    const BiddingEngineFactory = await hre.ethers.getContractFactory("BiddingEngine");
    const biddingEngine = await BiddingEngineFactory.deploy();
    await biddingEngine.waitForDeployment();
    const beAddress = await biddingEngine.getAddress();
    console.log(`✅ BiddingEngine deployed at: ${beAddress}`);

    // 3. Try setBiddingEngine on GyeManager
    // GyeManager may not have this function — check first
    let canSetBE = false;
    try {
        const iface = new hre.ethers.Interface([
            "function setBiddingEngine(address _be) external"
        ]);
        const code = await hre.ethers.provider.getCode(GYE_MANAGER_ADDRESS);
        const selector = iface.getFunction("setBiddingEngine")?.selector;
        canSetBE = code.includes(selector.slice(2));
    } catch { }

    if (canSetBE) {
        console.log(`\n🔧 Calling setBiddingEngine(${beAddress})...`);
        const gm = await hre.ethers.getContractAt(
            [...GYE_MANAGER_FULL_ABI, "function setBiddingEngine(address _be) external"],
            GYE_MANAGER_ADDRESS, signer
        );
        const tx = await gm.setBiddingEngine(beAddress);
        const receipt = await tx.wait();
        console.log(`   status: ${receipt?.status === 1 ? "✅ SUCCESS" : "❌ FAILED"}`);
    } else {
        console.log(`\n⚠️  GyeManager has no setBiddingEngine() function.`);
        console.log(`   You need to redeploy GyeManager with the new BiddingEngine address.`);
        console.log(`   Or use the env variable update approach below.\n`);
    }

    console.log(`\n📝 Update your .env and frontend/.env.local:`);
    console.log(`   BIDDING_ENGINE_ADDRESS=${beAddress}`);
    console.log(`   NEXT_PUBLIC_BIDDING_ENGINE_ADDRESS=${beAddress}`);
    console.log(`\n📝 Update frontend/src/lib/constants.ts:`);
    console.log(`   BIDDING_ENGINE: "${beAddress}",`);
}

main()
    .then(() => process.exit(0))
    .catch(err => { console.error("❌", err.message || err); process.exit(1); });
