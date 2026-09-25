import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const Factory = await ethers.getContractFactory("FashionProduct");
  const contract = await Factory.deploy(deployer.address, deployer.address);
  await contract.waitForDeployment();
  console.log(`FashionProduct deployed to: ${await contract.getAddress()}`);
  console.log(`Admin and initial minter: ${deployer.address}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
