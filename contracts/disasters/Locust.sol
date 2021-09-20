//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "../abstracts/Disaster.sol";
import "../integration/rarity_structs.sol";

contract Locust is Disaster {
  constructor() Disaster() {
    _setRequirements(14, 12, 10, 8, 8, 8);
    hp = 10000;
  }
}
