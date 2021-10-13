// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

const RarityAbi = require("./abis/rarity-abi.json");
const { NonceManager } = require("@ethersproject/experimental");

const hre = require("hardhat");
const { ethers } = require("hardhat");
const { deployments, getNamedAccounts } = require("hardhat");
const OldFarm = require("../deployments/fantom/BeginnerFarm.json");

async function main() {
  // console.log(ethers);
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const nonceManager = new NonceManager(signer);

  const NewFarm = await deployments.get("GrainFarm");
  const FruitFarm = await deployments.get("FruitFarm");
  const Apple = await deployments.get("Apple");
  const TestMinter = await deployments.get("TestMinter");
  const rarity = new ethers.Contract(
    "0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb",
    RarityAbi,
    nonceManager
  );
  const summoner1 = await rarity.next_summoner();

  await rarity.summon(1);
  const summoner2 = await rarity.next_summoner();
  await rarity.summon(2);
  const summoner3 = await rarity.next_summoner();
  await rarity.summon(3);
  const summoner4 = await rarity.next_summoner();
  await rarity.summon(4);

  const oldFarm = new ethers.Contract(
    OldFarm.address,
    OldFarm.abi,
    nonceManager
  );
  const newFarm = new ethers.Contract(
    NewFarm.address,
    NewFarm.abi,
    nonceManager
  );
  const fruitFarm = new ethers.Contract(
    FruitFarm.address,
    FruitFarm.abi,
    nonceManager
  );
  const testMinter = new ethers.Contract(
    TestMinter.address,
    TestMinter.abi,
    nonceManager
  );
  const apple = new ethers.Contract(Apple.address, Apple.abi, nonceManager);

  await rarity.setApprovalForAll(OldFarm.address, true);
  await rarity.setApprovalForAll(NewFarm.address, true);
  await rarity.setApprovalForAll(FruitFarm.address, true);
  await apple.addMinter(signer.address);

  const oldReceipt = await oldFarm.farmBarley(summoner1);
  const newReceipt = await newFarm.farm(summoner2, 0);
  const fruitReceipt = await fruitFarm.farm(summoner3, 0);
  const adventureReceipt = await rarity.adventure(summoner4);
  const directMint = await apple.mint(
    summoner1,
    ethers.constants.WeiPerEther.mul(3)
  );
  const testMinterReceipt = await testMinter.mint(
    summoner1,
    ethers.constants.WeiPerEther.mul(3)
  );
  const logs = await Promise.all([
    oldReceipt.wait(),
    newReceipt.wait(),
    fruitReceipt.wait(),
    adventureReceipt.wait(),
    directMint.wait(),
    testMinterReceipt.wait(),
  ]);

  console.log(`
  Old Farm: ${logs[0].gasUsed.toString()}
  New Farm: ${logs[1].gasUsed.toString()}
  Fruit Farm: ${logs[2].gasUsed.toString()}
  Adventure Gas: ${logs[3].gasUsed.toString()}
  Apple Mint: ${logs[4].gasUsed.toString()}
  Test Minter: ${logs[5].gasUsed.toString()}
  Adventure + Mint: ${logs[4].gasUsed.add(logs[3].gasUsed)}
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
