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

  struct Rewards {
    uint8 level1;
    uint8 level5;
    uint8 level10;
  }

  string public constant name = "RarityFarms";
  string public constant symbol = "BFARM";

  Corn public corn;
  Wheat public wheat;
  Tomato public tomato;
  Potato public potato;

  // Events

  constructor(
    address _rarity,
    Corn _corn,
    Wheat _wheat,
    Potato _potato,
    Tomato _tomato
  ) Farm(_rarity) {
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

  function pause() external returns (bool) {
    _pause();
    return true;
  }

  function unpause() external returns (bool) {
    _unpause();
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
}
