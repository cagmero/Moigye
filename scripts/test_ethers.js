import "@nomicfoundation/hardhat-ethers";
import hre from "hardhat";

async function main() {
    console.log("HRE keys after direct plugin import:", Object.keys(hre));
    if (hre.ethers) {
        const [deployer] = await hre.ethers.getSigners();
        console.log("Deployer:", deployer.address);
    }
}

main().catch(console.error);
