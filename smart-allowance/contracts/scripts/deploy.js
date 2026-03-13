const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const Factory = await ethers.getContractFactory("AllowanceManager");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✅ AllowanceManager deployed to:", address);
  console.log("   Network:", (await ethers.provider.getNetwork()).name);
  console.log("\n📋 Update these files with the contract address:");
  console.log("   frontend/src/contracts/AllowanceManager.js → ALLOWANCE_MANAGER_ADDRESS");
  console.log("   backend/.env → CONTRACT_ADDRESS");
}

main().catch((err) => { console.error(err); process.exit(1); });
