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

module.exports = {
  summoners,
  ownerSummonerAttributes,
  address1SummonerAttributes,
  contracts: {
    rarity,
    attributes,
  },
};
