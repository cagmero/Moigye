import hre from "hardhat";

async function main() {
    console.log("Hardhat network:", hre.network.name);
}

main().catch(console.error);
