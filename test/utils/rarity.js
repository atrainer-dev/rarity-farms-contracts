const rarityabi = require("../abi/rarity.json");
const attributesabi = require("../abi/attributes.json");

const rarityAddress = "0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb";
const rarityAttributesAddress = "0xB5F5AF1087A8DA62A23b08C00C6ec9af21F397a1";

const rarity = new ethers.Contract(rarityAddress, rarityabi);
const attributes = new ethers.Contract(rarityAttributesAddress, attributesabi);

const ownerSummonerAttributes = {
  strength: 16,
  dexterity: 15,
  constitution: 13,
  intelligence: 12,
  wisdom: 11,
  charisma: 10,
};

const address1SummonerAttributes = {
  strength: 10,
  dexterity: 11,
  constitution: 12,
  intelligence: 13,
  wisdom: 15,
  charisma: 16,
};

async function newSummoners(deployer, nondeployer) {
  const summonerId = await rarity.connect(deployer).next_summoner();
  const summoners = await Promise.all([
    rarity.connect(deployer).summon(3),
    rarity.connect(nondeployer).summon(4),
  ]);

  const receipts = await Promise.all([
    summoners[0].wait(),
    summoners[1].wait(),
  ]);
  /*
  const log1 = receipts[0].events?.filter((x) => {
    return x.event == "summoned";
  });

  const log2 = receipts[1].events?.filter((x) => {
    return x.event == "summoned";
  });

  const ownerSummoner = log1[0].args[2];
  const address1Summoner = log2[0].args[2];
  console.log("test", ownerSummoner.toString(), address1Summoner.toString());
  */
  return [summonerId, summonerId.add(1)];
}

async function summoners() {
  [owner, address1] = await ethers.getSigners();

  const summoners = await Promise.all([
    rarity.connect(owner).summon(3),
    rarity.connect(address1).summon(4),
  ]);

  const receipts = await Promise.all([
    summoners[0].wait(),
    summoners[1].wait(),
  ]);

  const log1 = receipts[0].events?.filter((x) => {
    return x.event == "summoned";
  });

  const log2 = receipts[1].events?.filter((x) => {
    return x.event == "summoned";
  });

  const ownerSummoner = log1[0].args[2];
  const address1Summoner = log2[0].args[2];

  await attributes
    .connect(owner)
    .point_buy(ownerSummoner, ...Object.values(ownerSummonerAttributes));
  await attributes
    .connect(address1)
    .point_buy(address1Summoner, ...Object.values(address1SummonerAttributes));

  return [ownerSummoner, address1Summoner];
}

async function summonAllSummoners(signer) {
  const summonerId = await rarity.connect(signer).next_summoner();

  await Promise.all([
    rarity.connect(signer).summon(1),
    rarity.connect(signer).summon(2),
    rarity.connect(signer).summon(3),
    rarity.connect(signer).summon(4),
    rarity.connect(signer).summon(5),
    rarity.connect(signer).summon(6),
    rarity.connect(signer).summon(7),
    rarity.connect(signer).summon(8),
    rarity.connect(signer).summon(9),
    rarity.connect(signer).summon(10),
    rarity.connect(signer).summon(11),
  ]);

  await Promise.all([
    attributes.connect(signer).point_buy(summonerId, 16, 15, 13, 12, 11, 10),
    attributes
      .connect(signer)
      .point_buy(summonerId.add(1), 10, 11, 12, 13, 15, 16),
    attributes
      .connect(signer)
      .point_buy(summonerId.add(2), 11, 10, 12, 15, 16, 13),
    attributes
      .connect(signer)
      .point_buy(summonerId.add(3), 10, 11, 12, 15, 16, 13),
    attributes
      .connect(signer)
      .point_buy(summonerId.add(4), 16, 13, 15, 12, 11, 10),
    attributes
      .connect(signer)
      .point_buy(summonerId.add(5), 12, 11, 10, 15, 16, 13),
    attributes
      .connect(signer)
      .point_buy(summonerId.add(6), 16, 15, 12, 13, 11, 10),
    attributes
      .connect(signer)
      .point_buy(summonerId.add(7), 15, 16, 13, 12, 11, 10),
    attributes
      .connect(signer)
      .point_buy(summonerId.add(8), 13, 16, 15, 12, 11, 10),
    attributes
      .connect(signer)
      .point_buy(summonerId.add(9), 13, 11, 12, 15, 16, 10),
    attributes
      .connect(signer)
      .point_buy(summonerId.add(10), 11, 13, 12, 15, 16, 10),
  ]);

  return [
    summonerId,
    summonerId.add(1),
    summonerId.add(2),
    summonerId.add(3),
    summonerId.add(4),
    summonerId.add(5),
    summonerId.add(6),
    summonerId.add(7),
    summonerId.add(8),
    summonerId.add(9),
    summonerId.add(10),
    summonerId.add(11),
  ];
}

async function summon(signer, cl, attrs) {
  const summonerId = await rarity.connect(signer).next_summoner();
  await rarity.connect(signer).summon(cl);
  await attributes
    .connect(signer)
    .point_buy(summonerId, ...Object.values(attrs));
  return summonerId;
}

module.exports = {
  summoners,
  ownerSummonerAttributes,
  address1SummonerAttributes,
  contracts: {
    rarity,
    attributes,
  },
  summonAllSummoners,
  summon,
  newSummoners,
};
