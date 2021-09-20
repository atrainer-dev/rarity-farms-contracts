//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../abstracts/Farm.sol";
import "../crops/Corn.sol";
import "../crops/Wheat.sol";
import "../crops/Potato.sol";
import "../crops/Tomato.sol";

contract BeginnerFarm is Farm {
  using SafeMath for uint256;

  string public constant name = "RarityFarms";
  string public constant symbol = "BFARM";

  Corn public corn;
  Wheat public wheat;
  Tomato public tomato;
  Potato public potato;

  // Events

  constructor(
    Corn _corn,
    Wheat _wheat,
    Potato _potato,
    Tomato _tomato
  ) Farm() {
    corn = _corn;
    wheat = _wheat;
    potato = _potato;
    tomato = _tomato;

    yieldBase = 2000;
  }

  function farmCorn(uint256 summoner) external {
    _farm(summoner, corn);
  }

  function farmWheat(uint256 summoner) external {
    _farm(summoner, wheat);
  }

  function farmPotato(uint256 summoner) external {
    _farm(summoner, potato);
  }

  function farmTomato(uint256 summoner) external {
    _farm(summoner, tomato);
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
