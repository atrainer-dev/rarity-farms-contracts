//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./Corn.sol";
import "./Wheat.sol";

contract BeginnerFarm is ERC20 {
  mapping(address => uint256) public lastInteraction;

  Corn public corn;
  Wheat public wheat;

  // Events
  event FarmCorn(address indexed sender, address indexed nft);
  event FarmWheat(address indexed sender, address indexed nft);

  constructor(Corn _corn, Wheat _wheat) ERC20("RarityFarms", "BeginnerFarm") {
    console.log("Deploying Beginner Farm ");

    corn = _corn;
    wheat = _wheat;
  }

  function farmCorn(address _nft) public {
    // Figure out how to do this once per day
    // Similar to adventure function.  https://ftmscan.com/address/0xce761d788df608bd21bdd59d6f4b54b2e27f25bb#code
    corn.mint(_nft);
    lastInteraction[_nft] = block.number;
    emit FarmCorn(msg.sender, _nft);
  }

  function farmWheat(address _nft) public {
    wheat.mint(_nft);
    lastInteraction[_nft] = block.number;
    emit FarmWheat(msg.sender, _nft);
  }
}
