const { NonceManager } = require("@ethersproject/experimental");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const nonceManager = new NonceManager(signer);

  // Resources
  const carrot = await deployments.get("Carrot");
  const onion = await deployments.get("Onion");
  const potato = await deployments.get("Potato");
  const tomato = await deployments.get("Tomato");

  const farm = await deploy("VeggieFarm", {
    from: deployer,
    args: [carrot.address, onion.address, potato.address, tomato.address],
    log: true,
  });

  if (farm.newlyDeployed) {
    const carrotContract = new ethers.Contract(
      carrot.address,
      carrot.abi,
      nonceManager
    );
    await carrotContract.addMinter(farm.address);

    const onionContract = new ethers.Contract(
      onion.address,
      onion.abi,
      nonceManager
    );
    await onionContract.addMinter(farm.address);

    const potatoContract = new ethers.Contract(
      potato.address,
      potato.abi,
      nonceManager
    );
    await potatoContract.addMinter(farm.address);

    const tomatoContract = new ethers.Contract(
      tomato.address,
      tomato.abi,
      nonceManager
    );
    await tomatoContract.addMinter(farm.address);
  }

  
};
module.exports.tags = ["VeggieFarm"];
