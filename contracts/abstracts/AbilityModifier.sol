// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

abstract contract AbilityModifier {
  uint8[6] public _increaseAbility = [0, 0, 0, 0, 0, 0];
  uint8[6] public _decreaseAbility = [0, 0, 0, 0, 0, 0];

  function getIncreasers() external view returns (uint8[6] memory) {
    return _increaseAbility;
  }

  function getDecreasers() external view returns (uint8[6] memory) {
    return _decreaseAbility;
  }
}
