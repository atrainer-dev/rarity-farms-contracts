//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./Rarity.sol";
import "./Ownable.sol";
import "./Pausable.sol";
import "./Crop.sol";

abstract contract Farm is Rarity, Ownable, Pausable {
  using SafeMath for uint256;

  uint256 constant DAY = 1 days;
  mapping(uint256 => uint256) public log;

  event FarmResource(
    address indexed sender,
    uint256 indexed nft,
    string resource
  );

  constructor(address _rarity) Rarity(_rarity) Ownable() {}

  function setRarity(address _rarity) external returns (bool) {
    require(owner == msg.sender, "Must be owner");
    _setRarity(_rarity);
    return true;
  }

  function setOwner(address _owner) external returns (bool) {
    require(owner == msg.sender, "Must be owner");
    _setOwner(_owner);
    return true;
  }

  function _farm(uint256 summoner, Crop crop) internal returns (bool) {
    require(_isPaused() == false, "Farm not available");
    require(block.timestamp > log[summoner], "Summoner not available to farm");
    // May do something with level here.  leval 1-5 get 1 per day.  5-10 get 2.  idk yet.
    // Figure out how to do this once per day
    // Similar to adventure function.  https://ftmscan.com/address/0xce761d788df608bd21bdd59d6f4b54b2e27f25bb#code
    crop.mint(summoner, 1 * 1e18);

    log[summoner] = block.timestamp + DAY;
    return true;
  }
}
