//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "../abstracts/Disaster.sol";
import "../integration/rarity_structs.sol";
import "../abstracts/Farm.sol";

contract Locust is Disaster {
  constructor(
    Farm farm,
    uint256 farmDamage,
    uint256 hp,
    uint32[6] memory _requirements
  ) Disaster(farm, farmDamage, hp, _requirements) {
    id = 1;
    classMultipliers = [2, 1, 1, 1, 3, 1, 2, 1, 1, 1, 1];
    attackAttr = 1; // Strength
  }
}
