import hre from "hardhat";

async function main() {
    console.log("HRE keys:", Object.keys(hre));
}

main().catch(console.error);
