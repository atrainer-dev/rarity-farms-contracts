// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

abstract contract PointModifier {
  // [HP, MP, STAMINA]
  uint8[3] public _pointIncreasers = [0, 0, 0];
  uint8[3] public _pointDecreasers = [0, 0, 0];

  function getPointIncreasers() external view returns (uint8[3] memory) {
    return _pointIncreasers;
  }

  function getPointDecreasers() external view returns (uint8[3] memory) {
    return _pointDecreasers;
  }

  function _setPointIncreasers(
    uint8 hp,
    uint8 mp,
    uint8 stamina
  ) internal {
    _pointIncreasers = [hp, mp, stamina];
  }

  function _setPointDecreasers(
    uint8 hp,
    uint8 mp,
    uint8 stamina
  ) internal {
    _pointDecreasers = [hp, mp, stamina];
  }
}
