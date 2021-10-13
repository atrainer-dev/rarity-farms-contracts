//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../abstracts/Resource.sol";

contract Meal is Resource {
  constructor() Resource() {
    _name = "Meal";
    _symbol = "MEAL";

    attributes.weight = 5;
  }
}
