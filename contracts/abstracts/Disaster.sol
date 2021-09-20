//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./Rarity.sol";
import "./Ownable.sol";
import "./Pausable.sol";
import "../integration/rarity_structs.sol";
import "./Farm.sol";

abstract contract Disaster is Rarity, Ownable, Pausable {
  using SafeMath for uint256;
  using SafeMath for uint32;
  using rl for *;

  uint256 public hp;
  uint256 public damage;
  uint32 public attackAttr;
  Farm public farm;

  rl._ability_scores public requirements;

  constructor() Rarity() Ownable() {
    damage = 0;
  }

  function attack(uint256 _summoner) external returns (uint256) {
    require(_scout(_summoner), "Your summoner is not powerful enough");
    require(_isPaused() == false, "Disaster has ended");
    _getRarity().adventure(_summoner);
    uint256 roll = _getRarityRandom().d20(_summoner);
    uint32 power = _getAttackPower(_summoner);
    uint256 attackDamage = roll.mul(power);
    damage = damage.add(attackDamage);
    if (damage > hp) {
      _endDisaster();
    }
    return attackDamage;
  }

  function scout(uint256 _summoner) external view returns (bool) {
    return _scout(_summoner);
  }

  function _scout(uint256 _summoner) internal view returns (bool) {
    (
      uint32 _str,
      uint32 _dex,
      uint32 _con,
      uint32 _int,
      uint32 _wis,
      uint32 _cha
    ) = _getRarityAttributes().ability_scores(_summoner);
    if (_str < requirements._str) {
      return false;
    } else if (_dex < requirements._dex) {
      return false;
    } else if (_con < requirements._con) {
      return false;
    } else if (_int < requirements._int) {
      return false;
    } else if (_wis < requirements._wis) {
      return false;
    } else if (_cha < requirements._cha) {
      return false;
    }

    return true;
  }

  function _getAttackPower(uint256 _summoner) internal view returns (uint32) {
    (
      uint32 _str,
      uint32 _dex,
      uint32 _con,
      uint32 _int,
      uint32 _wis,
      uint32 _cha
    ) = _getRarityAttributes().ability_scores(_summoner);
    if (attackAttr == 1) {
      return _str;
    } else if (attackAttr == 2) {
      return _dex;
    } else if (attackAttr == 3) {
      return _con;
    } else if (attackAttr == 4) {
      return _int;
    } else if (attackAttr == 5) {
      return _wis;
    } else if (attackAttr == 6) {
      return _cha;
    }

    return _str;
  }

  function _endDisaster() internal {
    farm.clearDisaster();
    _pause();
  }

  function _setRequirements(
    uint32 _str,
    uint32 _dex,
    uint32 _con,
    uint32 _int,
    uint32 _wis,
    uint32 _cha
  ) internal {
    requirements._str = _str;
    requirements._dex = _dex;
    requirements._con = _con;
    requirements._int = _int;
    requirements._wis = _wis;
    requirements._cha = _cha;
  }
}
