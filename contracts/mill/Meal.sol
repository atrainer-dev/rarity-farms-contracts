//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../abstracts/Resource.sol";

contract Meal is Resource {
  constructor() Resource(5) RERC20() {
    _name = "RarityFarms-Meal";
    _symbol = "MEAL";
  }
}
