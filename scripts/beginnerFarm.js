// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { NonceManager } = require("@ethersproject/experimental");

async function main() {
  const [deployer] = await ethers.getSigners();
  const nonceManager = new NonceManager(deployer);

  console.log(`
  Deploying to network: ${process.env.HARDHAT_NETWORK}
  Deploying contracts with the account: ${deployer.address}
  Account balance: ${(await deployer.getBalance()).toString()}
  `);

  const contracts = await Promise.all([
    ethers.getContractFactory("Corn"),
    ethers.getContractFactory("Wheat"),
    ethers.getContractFactory("Beans"),
    ethers.getContractFactory("Barley"),
  ]);

  const crops = await Promise.all([
    contracts[0].connect(nonceManager).deploy(),
    contracts[1].connect(nonceManager).deploy(),
    contracts[2].connect(nonceManager).deploy(),
    contracts[3].connect(nonceManager).deploy(),
  ]);

  const Farm = await ethers.getContractFactory("BeginnerFarm");

  farm = await Farm.connect(nonceManager).deploy(
    crops[0].address,
    crops[1].address,
    crops[2].address,
    crops[3].address
  );
  await farm.deployed();

  console.log(`
  {
      name: 'beginner',
      address: '${farm.address}',
      crops: [
        '${crops[0].address}',
        '${crops[1].address}',
        '${crops[2].address}',
        '${crops[3].address}',
      ],
    },
  `);

  await Promise.all([
    crops[0].connect(nonceManager).addMinter(farm.address),
    crops[1].connect(nonceManager).addMinter(farm.address),
    crops[2].connect(nonceManager).addMinter(farm.address),
    crops[3].connect(nonceManager).addMinter(farm.address),
  ]);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
