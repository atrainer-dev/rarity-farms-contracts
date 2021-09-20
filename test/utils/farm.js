async function deployBeginnerCrops() {
  [owner, address1] = await ethers.getSigners();

  const contracts = await Promise.all([
    ethers.getContractFactory("Corn"),
    ethers.getContractFactory("Wheat"),
    ethers.getContractFactory("Potato"),
    ethers.getContractFactory("Tomato"),
  ]);

  const deployed = await Promise.all([
    contracts[0].deploy(),
    contracts[1].deploy(),
    contracts[2].deploy(),
    contracts[3].deploy(),
  ]);

  return deployed;
}

async function deployBeginnerFarm(corn, wheat, potato, tomato) {
  [owner, address1] = await ethers.getSigners();

  const Farm = await ethers.getContractFactory("BeginnerFarm");

  farm = await Farm.deploy(
    corn.address,
    wheat.address,
    potato.address,
    tomato.address
  );
  await farm.deployed();

  await Promise.all([
    corn.connect(owner).addMinter(farm.address),
    wheat.connect(owner).addMinter(farm.address),
    potato.connect(owner).addMinter(farm.address),
    tomato.connect(owner).addMinter(farm.address),
  ]);

  return farm;
}

module.exports = {
  deployBeginnerFarm,
  deployBeginnerCrops,
};
