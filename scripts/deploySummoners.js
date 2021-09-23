// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

const RarityAbi = require("./abis/rarity-abi.json");
const AttributesAbi = require("./abis/attributes-abi.json");
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const rarity = new ethers.Contract(
    "0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb",
    RarityAbi,
    deployer
  );
  const attributes = new ethers.Contract(
    "0xB5F5AF1087A8DA62A23b08C00C6ec9af21F397a1",
    AttributesAbi,
    deployer
  );

  console.log(`
  Deploying to network: ${process.env.HARDHAT_NETWORK}
  Deploying summoners with the account: ${deployer.address}
  Account balance: ${(await deployer.getBalance()).toString()}
  `);
  const nextSummoner = await rarity.next_summoner();
  const summonerIds = [];
  for (let i = 1; i < 12; i++) {
    await rarity.summon(i);
    console.log(
      `Summoner ${nextSummoner.sub(1).add(i)} summoned as class ${i}`
    );
  }

  for (let i = 0; i < 11; i++) {
    const attrs = [13, 11, 12, 15, 16, 10]
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    await attributes.point_buy(nextSummoner.add(i), ...Object.values(attrs));
    console.log(
      `Summoner ${nextSummoner.add(i)} assigned attributes ${JSON.stringify(
        attrs
      )}`
    );
    summonerIds.push(nextSummoner.add(i));
  }
  console.log(
    "Summoner IDs: ",
    JSON.stringify(summonerIds.map((i) => i.toString()))
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
