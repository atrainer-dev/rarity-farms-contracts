const { NonceManager } = require("@ethersproject/experimental");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const nonceManager = new NonceManager(signer);

  // Farms
  const grain = await deployments.get("GrainFarm");
  const fruit = await deployments.get("FruitFarm");
  const veggie = await deployments.get("VeggieFarm");

  const farmProxy = await deploy("FarmProxy", {
    from: deployer,
    args: [grain.address, fruit.address, veggie.address],
    log: true,
  });

  console.log(`
Farm Proxy Contract: ${farmProxy.address}
`);
};
module.exports.tags = ["FarmProxy"];
