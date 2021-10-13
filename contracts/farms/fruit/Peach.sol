//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../../abstracts/Resource.sol";

contract Peach is Resource {
  constructor() Resource() {
    _name = "Peach";
    _symbol = "PEACH";

    attributes.weight = 6;
    attributes.pointIncreasers = [1, 0, 0];
  }
}
