// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Rarity.sol";
import "./Ownable.sol";
import "./Pausable.sol";

interface ICrop {
  function mint(uint256 summoner, uint256 amount) external;
}

abstract contract Farm is Rarity, Ownable, Pausable {
  uint256 public yield;
  uint32 public yieldBase;
  address public disaster;

  event FarmResource(
    uint256 indexed _summoner,
    address _crop,
    uint256 _amount,
    uint256 _yield,
    uint256 _roll,
    uint256 _level
  );

  constructor() Rarity() Ownable() {
    yield = 0;
    yieldBase = 5000;
    disaster = address(0);
  }

  function setOwner(address _owner) external returns (bool) {
    require(owner == msg.sender, "Must be owner");
    _setOwner(_owner);
    return true;
  }

  function _farm(uint256 _summoner, ICrop _crop) internal {
    require(_isPaused() == false, "Farm not available");
    _getRarity().adventure(_summoner);
    uint256[4] memory _stats = _getSummoner(_summoner);
    uint32 _multiplier = _yieldMultiplier();
    uint64 _amount = _multiplier * 1e18;
    _crop.mint(_summoner, _amount);
    uint256 _roll = _getRarityRandom().d20(_summoner);
    uint256 _yield = _roll * _stats[3];
    yield = yield + _yield;
    emit FarmResource(
      _summoner,
      address(_crop),
      _amount,
      _yield,
      _roll,
      _stats[3]
    );
  }

  function yieldMultiplier() external view returns (uint32) {
    return _yieldMultiplier();
  }

  function _yieldMultiplier() internal view returns (uint32) {
    if (yield < yieldBase) {
      return 1;
    } else if (yield < yieldBase * 2) {
      return 2;
    } else if (yield < yieldBase * 3) {
      return 3;
    } else if (yield < yieldBase * 4) {
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

  function setDisaster(address _addr, uint256 _yield) external {
    require(_isOwner(msg.sender), "Must be owner");
    _addPauser(_addr);
    disaster = _addr;
    yield = _yield;
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
