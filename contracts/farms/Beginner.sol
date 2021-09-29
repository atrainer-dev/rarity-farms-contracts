//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../abstracts/Farm.sol";

contract BeginnerFarm is Farm {
  string public constant name = "RarityFarms";
  string public constant symbol = "BFARM";

  ICrop public corn;
  ICrop public wheat;
  ICrop public beans;
  ICrop public barley;

  // Events

  constructor(
    address _corn,
    address _wheat,
    address _beans,
    address _barley
  ) Farm() {
    corn = ICrop(_corn);
    wheat = ICrop(_wheat);
    beans = ICrop(_beans);
    barley = ICrop(_barley);

    yieldBase = 5000;
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
