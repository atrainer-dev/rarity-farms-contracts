//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../abstracts/Ownable.sol";
import "../abstracts/Pausable.sol";
import "../abstracts/Rarity.sol";

interface ICrop {
  function burnFrom(uint256, uint256) external;

  function balanceOf(uint256) external view returns (uint256);
}

interface IRefinedResource {
  function mint(uint256 summoner, uint256 amount) external;
}

contract Mill is Ownable, Pausable, Rarity {
  uint8 public refiningCost = 2;

  ICrop public corn;
  ICrop public wheat;
  ICrop public beans;
  ICrop public barley;

  IRefinedResource public meal;
  IRefinedResource public flour;
  IRefinedResource public oil;
  IRefinedResource public malt;

  constructor(
    address _corn,
    address _wheat,
    address _beans,
    address _barley,
    address _meal,
    address _flour,
    address _oil,
    address _malt
  ) {
    corn = ICrop(_corn);
    wheat = ICrop(_wheat);
    beans = ICrop(_beans);
    barley = ICrop(_barley);
    meal = IRefinedResource(_meal);
    flour = IRefinedResource(_flour);
    oil = IRefinedResource(_oil);
    malt = IRefinedResource(_malt);
  }

  function refineCorn(uint256 summoner) external {
    _refine(summoner, meal, corn);
  }

  function refineWheat(uint256 summoner) external {
    _refine(summoner, flour, wheat);
  }

  function refineBeans(uint256 summoner) external {
    _refine(summoner, oil, beans);
  }

  function refineBarley(uint256 summoner) external {
    _refine(summoner, malt, barley);
  }

  function setRefiningCost(uint8 value) external {
    require(_isOwner(msg.sender), "Must be owner");
    refiningCost = value;
  }

  function _refine(
    uint256 summoner,
    IRefinedResource resource,
    ICrop crop
  ) internal {
    require(_isRarityOwner(summoner), "Must own NFT");
    require(_isPaused() == false, "Mill not available");
    uint256 balance = crop.balanceOf(summoner);
    require(balance >= refiningCost * 1e18, "Crop balance too low");
    crop.burnFrom(summoner, refiningCost * 1e18);
    resource.mint(summoner, 1 * 1e18);
  }
}
