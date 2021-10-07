const { NonceManager } = require("@ethersproject/experimental");
const { BigNumber, constants } = require("ethers");
const { summoners } = require("./utils/summoners");
const { deployments, getNamedAccounts } = require("hardhat");

const main = async () => {
  if (process.env.HARDHAT_NETWORK !== "localhost") {
    console.log("must be run on localhost");
    exit;
  }
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const nonceManager = new NonceManager(signer);
  const corn = await deployments.get("Corn");
  const wheat = await deployments.get("Wheat");
  const beans = await deployments.get("Beans");
  const barley = await deployments.get("Barley");
  const meal = await deployments.get("Meal");
  const flour = await deployments.get("Flour");
  const oil = await deployments.get("Oil");
  const malt = await deployments.get("Malt");

  console.log("Seeding Farm Resources");

  const cornContract = new ethers.Contract(
    corn.address,
    corn.abi,
    nonceManager
  );
  await cornContract.addMinter(signer.address);
  await Promise.all(
    summoners.map((summoner) =>
      cornContract.mint(summoner, constants.WeiPerEther.mul(10))
    )
  );
  const wheatContract = new ethers.Contract(
    wheat.address,
    wheat.abi,
    nonceManager
  );
  await wheatContract.addMinter(signer.address);
  await Promise.all(
    summoners.map((summoner) =>
      wheatContract.mint(summoner, constants.WeiPerEther.mul(10))
    )
  );

  const beansContract = new ethers.Contract(
    beans.address,
    beans.abi,
    nonceManager
  );
  await beansContract.addMinter(signer.address);
  await Promise.all(
    summoners.map((summoner) =>
      beansContract.mint(summoner, constants.WeiPerEther.mul(10))
    )
  );

  const barleyContract = new ethers.Contract(
    barley.address,
    barley.abi,
    nonceManager
  );
  await barleyContract.addMinter(signer.address);
  await Promise.all(
    summoners.map((summoner) =>
      barleyContract.mint(summoner, constants.WeiPerEther.mul(10))
    )
  );

  console.log("Seeding Mill Resources");
  const mealContract = new ethers.Contract(
    meal.address,
    meal.abi,
    nonceManager
  );
  await mealContract.addMinter(signer.address);
  await Promise.all(
    summoners.map((summoner) =>
      mealContract.mint(summoner, constants.WeiPerEther.mul(10))
    )
  );
  const flourContract = new ethers.Contract(
    flour.address,
    flour.abi,
    nonceManager
  );
  await flourContract.addMinter(signer.address);
  await Promise.all(
    summoners.map((summoner) =>
      flourContract.mint(summoner, constants.WeiPerEther.mul(10))
    )
  );

  const oilContract = new ethers.Contract(oil.address, oil.abi, nonceManager);
  await oilContract.addMinter(signer.address);
  await Promise.all(
    summoners.map((summoner) =>
      oilContract.mint(summoner, constants.WeiPerEther.mul(10))
    )
  );

  const maltContract = new ethers.Contract(
    malt.address,
    malt.abi,
    nonceManager
  );
  await maltContract.addMinter(signer.address);
  await Promise.all(
    summoners.map((summoner) =>
      maltContract.mint(summoner, constants.WeiPerEther.mul(10))
    )
  );

  console.log(`
Farm Contracts
["${cornContract.address}", "${wheatContract.address}", "${beansContract.address}", "${barleyContract.address}"]
`);

  console.log(`
Mill Contracts
["${mealContract.address}", "${flourContract.address}", "${oilContract.address}", "${maltContract.address}"]
`);
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
