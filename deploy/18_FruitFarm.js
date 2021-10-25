const { NonceManager } = require("@ethersproject/experimental");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const nonceManager = new NonceManager(signer);

  // Resources
  const apple = await deployments.get("Apple");
  const banana = await deployments.get("Banana");
  const peach = await deployments.get("Peach");
  const strawberry = await deployments.get("Strawberry");

  const farm = await deploy("FruitFarm", {
    from: deployer,
    args: [apple.address, banana.address, peach.address, strawberry.address],
    log: true,
  });

  if (farm.newlyDeployed) {
    const appleContract = new ethers.Contract(
      apple.address,
      apple.abi,
      nonceManager
    );
    await appleContract.addMinter(farm.address);

    const bananaContract = new ethers.Contract(
      banana.address,
      banana.abi,
      nonceManager
    );
    await bananaContract.addMinter(farm.address);

    const peachContract = new ethers.Contract(
      peach.address,
      peach.abi,
      nonceManager
    );
    await peachContract.addMinter(farm.address);

    const strawberryContract = new ethers.Contract(
      strawberry.address,
      strawberry.abi,
      nonceManager
    );
    await strawberryContract.addMinter(farm.address);
  }

};
module.exports.tags = ["FruitFarm"];
