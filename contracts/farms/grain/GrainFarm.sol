//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../../abstracts/NewFarm.sol";

contract GrainFarm is NewFarm {
  constructor(
    address _barley,
    address _bean,
    address _corn,
    address _wheat
  ) NewFarm(_barley, _bean, _corn, _wheat) {
    name = "Grain";
  }
}
