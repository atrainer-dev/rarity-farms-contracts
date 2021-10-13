//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../../abstracts/NewFarm.sol";

contract VeggieFarm is NewFarm {
  constructor(
    address _carrot,
    address _onion,
    address _potato,
    address _tomato
  ) NewFarm(_carrot, _onion, _potato, _tomato) {}
}
