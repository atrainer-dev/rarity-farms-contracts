//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./abstracts/Farm.sol";
import "./Corn.sol";
import "./Wheat.sol";

contract BeginnerFarm is Farm {
  using SafeMath for uint256;

  struct Rewards {
    uint8 level1;
    uint8 level5;
    uint8 level10;
  }

  string public constant name = "RarityFarms";
  string public constant symbol = "BFARM";

  Corn public corn;
  Wheat public wheat;

  // Events

  constructor(
    address _rarity,
    Corn _corn,
    Wheat _wheat
  ) Farm(msg.sender, _rarity) {
    console.log("Deploying Beginner Farm ");

    corn = _corn;
    wheat = _wheat;
  }

  function farmCorn(uint256 summoner) external returns (bool) {
    _farm(summoner, corn);
    emit FarmResource(msg.sender, summoner, "corn");
    return true;
  }

  function farmWheat(uint256 summoner) external returns (bool) {
    _farm(summoner, wheat);
    emit FarmResource(msg.sender, summoner, "wheat");
    return true;
  }
}
