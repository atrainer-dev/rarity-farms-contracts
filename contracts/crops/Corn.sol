//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "../abstracts/Crop.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Corn is Crop {
  constructor(address _rarity) RERC20(_rarity) {
    name = "RarityFarms-Corn";
    symbol = "CORN";
  }
}
