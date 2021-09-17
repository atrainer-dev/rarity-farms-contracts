//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./abstracts/Crop.sol";

contract Wheat is Crop {
  string public constant name = "RarityFarms";
  string public constant symbol = "WHEAT";

  constructor(address _rarity) RERC20(msg.sender, _rarity) {
    console.log("Deploying Wheat contract");
  }
}
