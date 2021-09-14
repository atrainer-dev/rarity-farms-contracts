//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./abstracts/Crop.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Corn is Crop {
  string public constant name = "RarityFarms";
  string public constant symbol = "CORN";

  constructor() RarityERC20(msg.sender) {
    console.log("Deploying Corn contract");
  }
}
