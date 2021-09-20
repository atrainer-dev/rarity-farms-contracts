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
  using SafeMath for uint32;

  uint256 public yield;
  uint32 public yieldBase;
  address public disaster;

  event FarmResource(
    address indexed sender,
    uint256 indexed nft,
    string resource
  );

  constructor() Rarity() Ownable() {
    yield = 0;
    yieldBase = 21000;
    disaster = address(0);
  }

  function setOwner(address _owner) external returns (bool) {
    require(owner == msg.sender, "Must be owner");
    _setOwner(_owner);
    return true;
  }

  function _farm(uint256 summoner, Crop crop) internal returns (bool) {
    require(_isPaused() == false, "Farm not available");
    // require(block.timestamp > log[summoner], "Summoner not available to farm");

    _getRarity().adventure(summoner);
    (uint32 s, uint32 d, , , , ) = _getRarityAttributes().ability_scores(
      summoner
    );
    uint32 multiplier = _yieldMultiplier();
    crop.mint(summoner, multiplier * 1e18);
    yield = yield.add(s).add(d);
    return true;
  }

  function _yieldMultiplier() internal view returns (uint32) {
    if (yield < yieldBase) {
      return 1;
    } else if (yield < yieldBase.mul(2)) {
      return 2;
    } else if (yield < yieldBase.mul(3)) {
      return 3;
    } else if (yield < yieldBase.mul(4)) {
      return 4;
    } else {
      return 5;
    }
  }

  function setYieldBase(uint32 base) external {
    require(_isOwner(msg.sender), "Must be owner");
    yieldBase = base;
  }

  function setYield(uint256 _yield) external {
    require(_isOwner(msg.sender), "Must be owner");
    yield = _yield;
  }

  function setDisaster(address _addr) external {
    require(_isOwner(msg.sender), "Must be owner");
    _addPauser(_addr);
    disaster = _addr;
    _pause();
  }

  function clearDisaster() external {
    require(
      _isOwner(msg.sender) || _isDisaster(msg.sender),
      "Must be owner or disaster"
    );
    _removePauser(disaster);
    disaster = address(0);
    _unpause();
  }

  function _isDisaster(address _addr) internal view returns (bool) {
    return disaster == _addr;
  }
}
