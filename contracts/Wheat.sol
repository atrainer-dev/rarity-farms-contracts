//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./abstracts/Crop.sol";

contract Wheat is Crop {
  constructor(address _rarity) RERC20(msg.sender, _rarity) {
    console.log("Deploying Wheat contract");
    name = "RarityFarms-Wheat";
    symbol = "WHEAT";
  }
}
