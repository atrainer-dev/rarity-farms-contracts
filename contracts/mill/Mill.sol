//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../abstracts/HasDisaster.sol";
import "../abstracts/Rarity.sol";

interface ICrop {
  function burnFrom(uint256, uint256) external;

  function balanceOf(uint256) external view returns (uint256);
}

interface IRefinedResource {
  function mint(uint256 summoner, uint256 amount) external;
}

contract Mill is HasDisaster, Rarity {
  uint8[4] public refiningCosts = [2, 2, 2, 2];

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

  function makeMeal(uint256 summoner, uint256 amount) external {
    _refine(summoner, meal, corn, amount, refiningCosts[0]);
  }

  function makeFlour(uint256 summoner, uint256 amount) external {
    _refine(summoner, flour, wheat, amount, refiningCosts[1]);
  }

  function makeOil(uint256 summoner, uint256 amount) external {
    _refine(summoner, oil, beans, amount, refiningCosts[2]);
  }

  function makeMalt(uint256 summoner, uint256 amount) external {
    _refine(summoner, malt, barley, amount, refiningCosts[3]);
  }

  function getRefiningCosts() external view returns (uint8[4] memory) {
    return refiningCosts;
  }

  function setRefiningCosts(
    uint8 cornCost,
    uint8 wheatCost,
    uint8 beansCost,
    uint8 barleyCost
  ) external {
    require(_isOwner(msg.sender), "Must be owner");
    refiningCosts = [cornCost, wheatCost, beansCost, barleyCost];
  }

  function _refine(
    uint256 summoner,
    IRefinedResource resource,
    ICrop crop,
    uint256 amount,
    uint8 refiningCost
  ) internal {
    require(_isRarityOwner(summoner), "Must own NFT");
    require(_isPaused() == false, "Mill not available");
    require(amount >= 1 * 1e18, "Amount too small");
    uint256 balance = crop.balanceOf(summoner);
    require(amount * refiningCost <= balance, "Crop balance too low");
    crop.burnFrom(summoner, amount * refiningCost);
    resource.mint(summoner, amount);
  }
}
