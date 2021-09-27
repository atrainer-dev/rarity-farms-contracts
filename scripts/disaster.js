// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

const hre = require("hardhat");
const { ownerSummonerAttributes } = require("../test/utils/rarity");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`
  Deploying to network: ${process.env.HARDHAT_NETWORK}
  Deploying Disaster with account: ${deployer.address}
  Account balance: ${(await deployer.getBalance()).toString()}
  `);

  const contracts = await Promise.all([
    ethers.getContractFactory("Locust"),
    ethers.getContractFactory("BeginnerFarm"),
  ]);

  const disasters = [
    {
      farm: "0xFD471836031dc5108809D173A067e8486B9047A3",
      damage: 22,
      hp: 500,
      requirements: [14, 12, 10, 8, 8, 8],
      type: 0,
    },
  ];

  const deployedDisasters = await Promise.all(
    disasters.map((disaster) =>
      contracts[disaster.type].deploy(
        disaster.farm,
        disaster.damage,
        disaster.hp,
        disaster.requirements
      )
    )
  );

  for (const disaster of deployedDisasters) {
    const farmContract = contracts[1].attach(await disaster.farm());
    const currentYield = await farmContract.yield();
    const farmDamage = await disaster.farmDamage();
    const setYield =
      currentYield < farmDamage ? 0 : currentYield.sub(farmDamage);
    await farmContract.setDisaster(disaster.address, setYield);

    console.log(`
  Disaster: ${disaster.address}
  Farm: ${await disaster.farm()}
  `);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
