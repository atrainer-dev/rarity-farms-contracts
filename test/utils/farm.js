async function deployBeginnerCrops() {
  [owner, address1] = await ethers.getSigners();

  const contracts = await Promise.all([
    ethers.getContractFactory("Corn"),
    ethers.getContractFactory("Wheat"),
    ethers.getContractFactory("Beans"),
    ethers.getContractFactory("Barley"),
  ]);

  const deployed = await Promise.all([
    contracts[0].deploy(),
    contracts[1].deploy(),
    contracts[2].deploy(),
    contracts[3].deploy(),
  ]);

  return deployed;
}

async function deployBeginnerFarm(corn, wheat, beans, barley) {
  [owner, address1] = await ethers.getSigners();

  const Farm = await ethers.getContractFactory("BeginnerFarm");

  farm = await Farm.deploy(
    corn.address,
    wheat.address,
    beans.address,
    barley.address
  );
  await farm.deployed();

  await Promise.all([
    corn.connect(owner).addMinter(farm.address),
    wheat.connect(owner).addMinter(farm.address),
    beans.connect(owner).addMinter(farm.address),
    barley.connect(owner).addMinter(farm.address),
  ]);

  return farm;
}

module.exports = {
  deployBeginnerFarm,
  deployBeginnerCrops,
};
