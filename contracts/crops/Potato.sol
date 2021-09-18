//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "../abstracts/Crop.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Potato is Crop {
  constructor(address _rarity) RERC20(_rarity) {
    name = "RarityFarms-Tomato";
    symbol = "Tomato";
  }
}
