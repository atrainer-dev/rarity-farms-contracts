//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "../abstracts/Crop.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Beans is Crop {
  constructor() RERC20() {
    name = "RarityFarms-Beans";
    symbol = "BEANS";
  }
}
