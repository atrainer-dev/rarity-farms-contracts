//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../abstracts/Farm.sol";
import "../crops/Corn.sol";
import "../crops/Wheat.sol";
import "../crops/Beans.sol";
import "../crops/Barley.sol";

contract BeginnerFarm is Farm {
  using SafeMath for uint256;

  string public constant name = "RarityFarms";
  string public constant symbol = "BFARM";

  Corn public corn;
  Wheat public wheat;
  Beans public beans;
  Barley public barley;

  // Events

  constructor(
    Corn _corn,
    Wheat _wheat,
    Beans _beans,
    Barley _barley
  ) Farm() {
    corn = _corn;
    wheat = _wheat;
    beans = _beans;
    barley = _barley;

    yieldBase = 2000;
  }

  function farm(uint256 summoner, uint8 resource) external {
    require(resource > 0 && resource < 5, "Invalid Resource");
    if (resource == 1) {
      _farm(summoner, corn);
    } else if (resource == 2) {
      _farm(summoner, wheat);
    } else if (resource == 3) {
      _farm(summoner, beans);
    } else if (resource == 4) {
      _farm(summoner, barley);
    }
  }

  function farmCorn(uint256 summoner) external {
    _farm(summoner, corn);
  }

  function farmWheat(uint256 summoner) external {
    _farm(summoner, wheat);
  }

  function farmBeans(uint256 summoner) external {
    _farm(summoner, beans);
  }

  function farmBarley(uint256 summoner) external {
    _farm(summoner, barley);
  }

  function addPauser(address addr) external {
    require(_isOwner(msg.sender), "Must be owner");
    _addPauser(addr);
  }

  function removePauser(address addr) external {
    require(_isOwner(msg.sender), "Must be owner");
    _removePauser(addr);
  }
}
