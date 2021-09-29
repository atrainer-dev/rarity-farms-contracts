//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../abstracts/Disaster.sol";

contract Flood is Disaster {
  constructor(
    address farm,
    uint256 farmDamage,
    uint256 hp,
    uint32[6] memory _requirements
  ) Disaster(farm, farmDamage, hp, _requirements) {
    id = 2;
    classMultipliers = [1, 1, 2, 2, 1, 3, 1, 1, 1, 1, 1];
    attackAttr = 5; // Wisdom
  }
}
