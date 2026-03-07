const hre = require("hardhat");

async function main() {
    console.log("🚀 Starting Automated Deployment & Verification on Creditcoin Testnet...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📍 Deployer:", deployer.address);

    // 1. Deploy MoigyeSBT
    console.log("\n📦 Deploying MoigyeSBT...");
    const MoigyeSBT = await hre.ethers.getContractFactory("MoigyeSBT");
    const sbt = await MoigyeSBT.deploy();
    await sbt.waitForDeployment();
    const sbtAddress = await sbt.getAddress();
    console.log(`✅ MoigyeSBT deployed at: ${sbtAddress}`);

    // 2. Deploy ScoreManager
    console.log("\n📦 Deploying ScoreManager...");
    const ScoreManager = await hre.ethers.getContractFactory("ScoreManager");
    const scoreManager = await ScoreManager.deploy();
    await scoreManager.waitForDeployment();
    const scoreManagerAddress = await scoreManager.getAddress();
    console.log(`✅ ScoreManager deployed at: ${scoreManagerAddress}`);

    // 3. Deploy BiddingEngine
    console.log("\n📦 Deploying BiddingEngine...");
    const BiddingEngine = await hre.ethers.getContractFactory("BiddingEngine");
    const biddingEngine = await BiddingEngine.deploy();
    await biddingEngine.waitForDeployment();
    const biddingEngineAddress = await biddingEngine.getAddress();
    console.log(`✅ BiddingEngine deployed at: ${biddingEngineAddress}`);

    // 4. Deploy GyeManager
    console.log("\n📦 Deploying GyeManager...");
    const GyeManager = await hre.ethers.getContractFactory("GyeManager");
    const gyeManager = await GyeManager.deploy(biddingEngineAddress, scoreManagerAddress);
    await gyeManager.waitForDeployment();
    const gyeManagerAddress = await gyeManager.getAddress();
    console.log(`✅ GyeManager deployed at: ${gyeManagerAddress}`);

    // 5. Link Contracts
    console.log("\n🔗 Linking contracts...");
    await scoreManager.setGyeManager(gyeManagerAddress);
    await scoreManager.setReputationSBT(sbtAddress);
    await sbt.setAuthorizedManager(scoreManagerAddress);
    console.log("✅ Contracts linked successfully.");

    // 6. Wait for block confirmations
    console.log("\n⏳ Waiting for 5 block confirmations for verification...");
    const deploymentReceipt = await gyeManager.deploymentTransaction().wait(5);
    console.log("✅ Confirmations received.");

    // 7. Verify Contracts
    console.log("\n🔍 Starting programmatic verification on Blockscout...");

    try {
        console.log("Verifying MoigyeSBT...");
        await hre.run("verify:verify", {
            address: sbtAddress,
            constructorArguments: [],
        });
    } catch (e) {
        console.log(`MoigyeSBT verification failed: ${e.message}`);
    }

    try {
        console.log("Verifying ScoreManager...");
        await hre.run("verify:verify", {
            address: scoreManagerAddress,
            constructorArguments: [],
        });
    } catch (e) {
        console.log(`ScoreManager verification failed: ${e.message}`);
    }

    try {
        console.log("Verifying BiddingEngine...");
        await hre.run("verify:verify", {
            address: biddingEngineAddress,
            constructorArguments: [],
        });
    } catch (e) {
        console.log(`BiddingEngine verification failed: ${e.message}`);
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

    console.log("\n✨ Deployment and Verification Complete!");
    console.log("-----------------------------------------");
    console.log(`MoigyeSBT: ${sbtAddress}`);
    console.log(`ScoreManager: ${scoreManagerAddress}`);
    console.log(`BiddingEngine: ${biddingEngineAddress}`);
    console.log(`GyeManager: ${gyeManagerAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
