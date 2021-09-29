//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../abstracts/Disaster.sol";

contract Locust is Disaster {
  constructor(
    address farm,
    uint256 farmDamage,
    uint256 hp,
    uint32[6] memory _requirements
  ) Disaster(farm, farmDamage, hp, _requirements) {
    id = 1;
    classMultipliers = [2, 1, 1, 1, 3, 1, 2, 1, 1, 1, 1];
    attackAttr = 1; // Strength
  }
}
