//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../../abstracts/Resource.sol";

contract Tomato is Resource {
  constructor() Resource() {
    _name = "Tomato";
    _symbol = "TOMATO";

    attributes.weight = 4;
    attributes.pointIncreasers = [1, 0, 0];
  }
}
