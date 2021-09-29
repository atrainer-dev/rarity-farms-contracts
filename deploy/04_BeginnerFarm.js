const { NonceManager } = require("@ethersproject/experimental");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const nonceManager = new NonceManager(signer);
  const corn = await deployments.get("Corn");
  const wheat = await deployments.get("Wheat");
  const beans = await deployments.get("Beans");
  const barley = await deployments.get("Barley");
  const farm = await deploy("BeginnerFarm", {
    from: deployer,
    args: [corn.address, wheat.address, beans.address, barley.address],
    log: true,
  });
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
  const beansContract = new ethers.Contract(
    beans.address,
    beans.abi,
    nonceManager
  );
  await beansContract.addMinter(farm.address);
  const barleyContract = new ethers.Contract(
    barley.address,
    barley.abi,
    nonceManager
  );
  await barleyContract.addMinter(farm.address);
};
module.exports.tags = ["BeginnerFarm"];
