//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../../abstracts/Resource.sol";

contract Banana is Resource {
  constructor() Resource() {
    _name = "Banana";
    _symbol = "BANANA";

    attributes.weight = 7;
    attributes.pointIncreasers = [0, 0, 1];
  }
}
