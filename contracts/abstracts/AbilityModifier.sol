// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

abstract contract AbilityModifier {
  uint8[6] public _abilityIncreasers = [0, 0, 0, 0, 0, 0];
  uint8[6] public _abilityDecreasers = [0, 0, 0, 0, 0, 0];

  function getAbilityIncreasers() external view returns (uint8[6] memory) {
    return _abilityIncreasers;
  }

  function getAbilityDecreasers() external view returns (uint8[6] memory) {
    return _abilityDecreasers;
  }

  function _setAbilityIncreasers(
    uint8 str,
    uint8 dex,
    uint8 con,
    uint8 inte,
    uint8 wis,
    uint8 char
  ) internal {
    _abilityIncreasers = [str, dex, con, inte, wis, char];
  }

  function _setAbilityDecreasers(
    uint8 str,
    uint8 dex,
    uint8 con,
    uint8 inte,
    uint8 wis,
    uint8 char
  ) internal {
    _abilityDecreasers = [str, dex, con, inte, wis, char];
  }
}
