//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../../abstracts/Resource.sol";

contract Apple is Resource {
  constructor() Resource() {
    _name = "Apple";
    _symbol = "APPLE";

    attributes.weight = 8;
    attributes.pointIncreasers = [0, 1, 0];
  }
}
