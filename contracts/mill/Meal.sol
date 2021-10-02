//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../abstracts/Resource.sol";

contract Meal is Resource {
  constructor() RERC20() {
    _name = "RarityFarms-Meal";
    _symbol = "MEAL";
  }
}
