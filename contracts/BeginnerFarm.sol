//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./abstracts/RERC20.sol";
import "./Corn.sol";
import "./Wheat.sol";

interface Rarity {
  function level(uint256) external view returns (uint256);

  function getApproved(uint256) external view returns (address);

  function ownerOf(uint256) external view returns (address);
}

contract BeginnerFarm is RERC20 {
  using SafeMath for uint256;

  struct Rewards {
    uint8 level1;
    uint8 level5;
    uint8 level10;
  }

  string public constant name = "RarityFarms";
  string public constant symbol = "BFARM";
  uint256 constant DAY = 1 days;

  mapping(uint256 => uint256) public log;

  Corn public corn;
  Wheat public wheat;

  // Events
  event Farm(address indexed sender, uint256 indexed nft, uint8 resource);

  constructor(
    address _rarity,
    Corn _corn,
    Wheat _wheat
  ) RERC20(msg.sender, _rarity) {
    console.log("Deploying Beginner Farm ");

    corn = _corn;
    wheat = _wheat;
  }

  function farm(uint256 summoner, uint8 resource) external returns (bool) {
    require(_isApprovedOrOwner(summoner));
    require(block.timestamp > log[summoner]);
    require(resource > 0 && resource < 3, "Resource not valid");
    // May do something with level here.  leval 1-5 get 1 per day.  5-10 get 2.  idk yet.
    // Figure out how to do this once per day
    // Similar to adventure function.  https://ftmscan.com/address/0xce761d788df608bd21bdd59d6f4b54b2e27f25bb#code
    if (resource == 1) {
      corn.mint(summoner, 1 * 1e18);
    } else if (resource == 2) {
      wheat.mint(summoner, 1 * 1e18);
    }

    log[summoner] = block.timestamp + DAY;
    emit Farm(msg.sender, summoner, resource);
    return true;
  }
}
