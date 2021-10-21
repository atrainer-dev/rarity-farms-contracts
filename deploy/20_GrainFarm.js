const { NonceManager } = require("@ethersproject/experimental");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const nonceManager = new NonceManager(signer);

  // Resources
  const barley = await deployments.get("Barley");
  const beans = await deployments.get("Beans");
  const corn = await deployments.get("Corn");
  const wheat = await deployments.get("Wheat");

  const farm = await deploy("GrainFarm", {
    from: deployer,
    args: [barley.address, beans.address, corn.address, wheat.address],
    log: true,
  });

  if (farm.newlyDeployed) {
    const barleyContract = new ethers.Contract(
      barley.address,
      barley.abi,
      nonceManager
    );
    await barleyContract.addMinter(farm.address);

    const beanContract = new ethers.Contract(
      beans.address,
      beans.abi,
      nonceManager
    );
    await beanContract.addMinter(farm.address);

    const cornContract = new ethers.Contract(
      corn.address,
      corn.abi,
      nonceManager
    );
    await cornContract.addMinter(farm.address);

    const wheatContract = new ethers.Contract(
      wheat.address,
      wheat.abi,
      nonceManager
    );
    await wheatContract.addMinter(farm.address);
  }

  console.log(`
Grain Farm Contract: ${farm.address}
Grain Farm Resource Contracts:
["${barley.address}", "${beans.address}", "${corn.address}", "${wheat.address}"]
`);
};
module.exports.tags = ["GrainFarm"];
