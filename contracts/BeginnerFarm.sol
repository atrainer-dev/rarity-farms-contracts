//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./Corn.sol";
import "./Wheat.sol";

interface Rarity {
  function level(uint256) external view returns (uint256);

  function getApproved(uint256) external view returns (address);

  function ownerOf(uint256) external view returns (address);
}

contract BeginnerFarm is ERC20 {
  Rarity constant rm = Rarity(0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb);
  mapping(uint256 => uint256) public log;

  Corn public corn;
  Wheat public wheat;

  // Events
  event FarmCorn(address indexed sender, uint256 indexed nft);
  event FarmWheat(address indexed sender, uint256 indexed nft);

  constructor(Corn _corn, Wheat _wheat) ERC20("RarityFarms", "BeginnerFarm") {
    console.log("Deploying Beginner Farm ");

    corn = _corn;
    wheat = _wheat;
  }

  function farmCorn(uint256 summoner) public {
    // May do something with level here.  leval 1-5 get 1 per day.  5-10 get 2.  idk yet.
    // Figure out how to do this once per day
    // Similar to adventure function.  https://ftmscan.com/address/0xce761d788df608bd21bdd59d6f4b54b2e27f25bb#code
    corn.mint(summoner, 1 * 1e18);
    log[summoner] = block.number;
    emit FarmCorn(msg.sender, summoner);
  }

  function farmWheat(uint256 summoner) public {
    wheat.mint(summoner, 1 * 1e18);
    log[summoner] = block.number;
    emit FarmWheat(msg.sender, summoner);
  }
}
