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

  uint32 public id;
  uint256 public hp;
  uint256 public damage;
  uint256 public farmDamage;
  uint32 public attackAttr;
  Farm public farm;

  uint32[6] public scoreRequirements;
  uint32[11] public classMultipliers;

  // Events
  event Attack(
    uint256 indexed _summoner,
    uint256 attack,
    uint256 roll,
    uint256 multiplier,
    uint256 power
  );

  event Cleared(uint256 indexed _summoner, bool _paused);

  constructor(
    Farm _farm,
    uint256 _farmDamage,
    uint256 _hp,
    uint32[6] memory _requirements
  ) Rarity() Ownable() {
    hp = _hp;
    farmDamage = _farmDamage;
    scoreRequirements = _requirements;
    damage = 0;
    farm = _farm;
  }

  function attack(uint256 _summoner) external returns (uint256[4] memory) {
    require(_isPaused() == false, "Disaster has ended");
    require(_isRarityOwner(_summoner), "Must be owner");
    uint32[6] memory _scores = _getSummonerAttributes(_summoner);
    uint256[4] memory _stats = _getSummoner(_summoner);
    require(_scout(_scores), "Your summoner is not powerful enough");

    _getRarity().adventure(_summoner);
    uint256 roll = _getRarityRandom().d20(_summoner);
    uint32 power = _getAttackScore(_summoner);
    uint32 multiplier = _getClassMultiplier(_stats[2]);
    uint256 attackDamage = roll.mul(power).mul(multiplier);
    damage = damage.add(attackDamage);
    if (damage > hp) {
      _endDisaster();
      emit Cleared(_summoner, paused);
    }
    emit Attack(_summoner, attackDamage, roll, multiplier, power);
    return [attackDamage, roll, multiplier, power];
  }

  function scout(uint256 _summoner) external view returns (bool) {
    uint32[6] memory _scores = _getSummonerAttributes(_summoner);
    return _scout(_scores);
  }

  function _scout(uint32[6] memory _scores) internal view returns (bool) {
    uint256 arrayLength = scoreRequirements.length;
    for (uint256 i = 0; i < arrayLength; i++) {
      if (_scores[i] < scoreRequirements[i]) {
        return false;
      }
    }

    return true;
  }

  function _getAttackScore(uint256 _summoner) internal view returns (uint32) {
    uint32[6] memory _scores = _getSummonerAttributes(_summoner);
    return _scores[attackAttr.sub(1)];
  }

  function _endDisaster() internal {
    farm.clearDisaster();
    _pause();
  }

  function _getClassMultiplier(uint256 _class) internal view returns (uint32) {
    return classMultipliers[_class.sub(1)];
  }

  function getClassMultipliers() external view returns (uint32[11] memory) {
    return classMultipliers;
  }

  function getScoreRequirements() external view returns (uint32[6] memory) {
    return scoreRequirements;
  }
}
