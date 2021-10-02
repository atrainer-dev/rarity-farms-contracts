//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../abstracts/Crop.sol";

contract Malt is Crop {
  constructor() RERC20() {
    _name = "RarityFarms-Malt";
    _symbol = "MALT";
  }
}
