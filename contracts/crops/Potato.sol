//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "../abstracts/Crop.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Potato is Crop {
  constructor() RERC20() {
    name = "RarityFarms-Tomato";
    symbol = "Tomato";
  }
}
