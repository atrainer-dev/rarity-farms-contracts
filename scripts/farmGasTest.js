// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

const OldFarm = require("../deployments/fantom/BeginnerFarm.json");
const NewFarm = require("../deployments/localhost/GrainFarm.json");
const RarityAbi = require("./abis/rarity-abi.json");

const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const rarity = new ethers.Contract(
    "0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb",
    RarityAbi,
    deployer
  );
  const summoner1 = await rarity.next_summoner();

  await rarity.summon(1);
  const summoner2 = await rarity.next_summoner();
  await rarity.summon(2);

  const oldFarm = new ethers.Contract(OldFarm.address, OldFarm.abi, deployer);
  const newFarm = new ethers.Contract(NewFarm.address, NewFarm.abi, deployer);

  await rarity.setApprovalForAll(OldFarm.address, true);
  await rarity.setApprovalForAll(NewFarm.address, true);

  const oldReceipt = await oldFarm.farmBarley(summoner1);
  const newReceipt = await newFarm.farm(summoner2, 0);
  const logs = await Promise.all([oldReceipt.wait(), newReceipt.wait()]);
  console.log(`
  Old Farm: ${logs[0].gasUsed.toString()}
  New Farm: ${logs[1].gasUsed.toString()}
  `);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
