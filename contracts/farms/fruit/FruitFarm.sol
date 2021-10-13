//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../../abstracts/NewFarm.sol";

contract FruitFarm is NewFarm {
  constructor(
    address _apple,
    address _banana,
    address _peach,
    address _strawberry
  ) NewFarm(_apple, _banana, _peach, _strawberry) {}
}
