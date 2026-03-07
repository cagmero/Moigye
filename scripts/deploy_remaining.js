import hre from "hardhat";

async function main() {
    console.log("🚀 Deploying Remaining Moigye Contracts (GyeManager & GyeStaking)...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📍 Deployer:", deployer.address);

    // Existing addresses from README
    const biddingEngineAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
    const scoreManagerAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

    // 1. Deploy GyeStaking
    console.log("\n📦 Deploying GyeStaking...");
    const GyeStaking = await hre.ethers.getContractFactory("GyeStaking");
    const gyeStaking = await GyeStaking.deploy();
    await gyeStaking.waitForDeployment();
    const gyeStakingAddress = await gyeStaking.getAddress();
    console.log(`✅ GyeStaking deployed at: ${gyeStakingAddress}`);

    // 2. Deploy GyeManager
    console.log("\n📦 Deploying GyeManager...");
    const GyeManager = await hre.ethers.getContractFactory("GyeManager");
    const gyeManager = await GyeManager.deploy(biddingEngineAddress, scoreManagerAddress);
    await gyeManager.waitForDeployment();
    const gyeManagerAddress = await gyeManager.getAddress();
    console.log(`✅ GyeManager deployed at: ${gyeManagerAddress}`);

    // 3. Wait for block confirmations
    console.log("\n⏳ Waiting for 5 block confirmations for verification...");
    const tx = gyeManager.deploymentTransaction();
    if (tx) {
        await tx.wait(5);
        console.log("✅ Confirmations received.");
    } else {
        console.log("⚠️ No deployment transaction found (contract might already exist or failed).");
    }

    // 4. Verify Contracts
    console.log("\n🔍 Starting programmatic verification on Blockscout...");

    try {
        console.log("Verifying GyeStaking...");
        await hre.run("verify:verify", {
            address: gyeStakingAddress,
            constructorArguments: [],
        });
    } catch (e) {
        console.log(`GyeStaking verification failed: ${e.message}`);
    }

    try {
        console.log("Verifying GyeManager...");
        await hre.run("verify:verify", {
            address: gyeManagerAddress,
            constructorArguments: [biddingEngineAddress, scoreManagerAddress],
        });
    } catch (e) {
        console.log(`GyeManager verification failed: ${e.message}`);
    }

    console.log("\n✨ Remaining Deployment Complete!");
    console.log("-----------------------------------------");
    console.log(`GyeStaking: ${gyeStakingAddress}`);
    console.log(`GyeManager: ${gyeManagerAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
