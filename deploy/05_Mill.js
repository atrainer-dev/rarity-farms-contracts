const { NonceManager } = require("@ethersproject/experimental");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const nonceManager = new NonceManager(signer);

  // Crops
  const corn = await deployments.get("Corn");
  const wheat = await deployments.get("Wheat");
  const beans = await deployments.get("Beans");
  const barley = await deployments.get("Barley");

  const meal = await deploy("Meal", {
    from: deployer,
    args: [],
    log: true,
  });

  const flour = await deploy("Flour", {
    from: deployer,
    args: [],
    log: true,
  });

  const oil = await deploy("Oil", {
    from: deployer,
    args: [],
    log: true,
  });

  const malt = await deploy("Malt", {
    from: deployer,
    args: [],
    log: true,
  });

  const mill = await deploy("Mill", {
    from: deployer,
    args: [
      corn.address,
      wheat.address,
      beans.address,
      barley.address,
      meal.address,
      flour.address,
      oil.address,
      malt.address,
    ],
    log: true,
  });

  const mealContract = new ethers.Contract(
    meal.address,
    meal.abi,
    nonceManager
  );
  await mealContract.addMinter(mill.address);

  const flourContract = new ethers.Contract(
    flour.address,
    flour.abi,
    nonceManager
  );
  await flourContract.addMinter(mill.address);

  const oilContract = new ethers.Contract(oil.address, oil.abi, nonceManager);
  await oilContract.addMinter(mill.address);

  const maltContract = new ethers.Contract(
    malt.address,
    malt.abi,
    nonceManager
  );
  await maltContract.addMinter(mill.address);
};
module.exports.tags = ["Mill"];
