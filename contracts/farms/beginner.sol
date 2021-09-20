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

  function farmPotato(uint256 summoner) external returns (bool) {
    _farm(summoner, potato);
    emit FarmResource(msg.sender, summoner, "potato");
    return true;
  }

  function farmTomato(uint256 summoner) external returns (bool) {
    _farm(summoner, tomato);
    emit FarmResource(msg.sender, summoner, "tomato");
    return true;
  }

  function addPauser(address addr) external returns (bool) {
    require(_isOwner(msg.sender), "Must be owner");
    _addPauser(addr);
    return true;
  }

  function removePauser(address addr) external returns (bool) {
    require(_isOwner(msg.sender), "Must be owner");
    _removePauser(addr);
    return true;
  }

  //TODO:  when a summoner farms add one of their attributes, need to look to see what is best, to a counter.
  // If counter gets passed certain thresholds then it mints more resources.
  // Farming should do rm.adventure()
  // Disasters reduce the counter
  // Disasters pause the farm then unpause when done
  // Disaster has a hit count as well that summoners will use strength.
}
