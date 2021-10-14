//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../abstracts/Rarity.sol";

interface IFarm {
  function farm(uint256 summoner, uint8 resource) external;
}

interface IRarityApprove {
  function setApprovalForAll(address operator, bool _approved) external;
}

contract FarmProxy is Rarity {
  IRarityApprove constant rmApprove =
    IRarityApprove(0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb);

  IFarm private grain;
  IFarm private fruit;
  IFarm private veggie;

  struct Routine {
    uint256 summoner;
    uint8 farm;
    uint8 resource;
  }

  constructor(
    address _grain,
    address _fruit,
    address _veggie
  ) {
    grain = IFarm(_grain);
    fruit = IFarm(_fruit);
    veggie = IFarm(_veggie);
  }

  function executeRoutines(Routine[] memory routines) external {
    uint256 arrayLength = routines.length;
    for (uint256 i = 0; i < arrayLength; i++) {
      if (routines[i].farm == 0) {
        grain.farm(routines[i].summoner, routines[i].resource);
      } else if (routines[i].farm == 1) {
        fruit.farm(routines[i].summoner, routines[i].resource);
      } else if (routines[i].farm == 2) {
        veggie.farm(routines[i].summoner, routines[i].resource);
      }
    }
  }
}
