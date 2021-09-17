//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./abstracts/Crop.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Corn is Crop {
  string public constant name = "RarityFarms-Corn";
  string public constant symbol = "CORN";

  constructor(address _rarity) RERC20(msg.sender, _rarity) {}
}
