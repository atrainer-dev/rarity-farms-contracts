//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../abstracts/Crop.sol";

contract Barley is Crop {
  constructor() RERC20() {
    name = "RarityFarms-Barley";
    symbol = "BARLEY";
  }
}
