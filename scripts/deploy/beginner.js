// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("ethers");
const hre = require("hardhat");
const constants = require("./constants");

async function main() {
  const [deployer] = await ethers.getSigners();
  const config = constants[process.env.HARDHAT_NETWORK];

  console.log(`
  Deploying to network: ${process.env.HARDHAT_NETWORK}
  Deploying contracts with the account: ${deployer.address}
  Account balance: ${(await deployer.getBalance()).toString()}
  Rarity Address: ${config.rarity}
  `);

  // We get the contract to deploy
  const Corn = await hre.ethers.getContractFactory("Corn");
  const Wheat = await hre.ethers.getContractFactory("Wheat");
  const Bfarm = await hre.ethers.getContractFactory("BeginnerFarm");

  console.log("Deploying Corn Contract");
  const corn = await Corn.deploy(config.rarity);
  console.log("Deploying Wheat Contract");
  const wheat = await Wheat.deploy(config.rarity);

  console.log("Crops deployed");

  await corn.deployed();
  console.log("Corn deployed to:", corn.address);
  await wheat.deployed();
  console.log("Wheat deployed to:", wheat.address);

  console.log("Deploying Farm Contract");
  const bfarm = await Bfarm.deploy(config.rarity, corn.address, wheat.address);
  await bfarm.deployed();

  console.log("Beginner Farm deployed to:", bfarm.address);

  console.log("Adding Minter to crops");
  await Corn.addMinter(bfarm.address);
  await Wheat.addMinter(bfarm.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
