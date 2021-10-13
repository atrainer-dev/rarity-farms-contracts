//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../../abstracts/Resource.sol";

contract Carrot is Resource {
  constructor() Resource() {
    _name = "Carrot";
    _symbol = "CARROT";

    attributes.weight = 2;
    attributes.pointIncreasers = [0, 1, 0];
  }
}
