//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../abstracts/Crop.sol";

contract Beans is Crop {
  constructor() RERC20() {
    _name = "RarityFarms-Beans";
    _symbol = "BEANS";
  }
}
