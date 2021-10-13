//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../../abstracts/Resource.sol";

contract Onion is Resource {
  constructor() Resource() {
    _name = "Onion";
    _symbol = "ONION";

    attributes.weight = 7;
    attributes.pointIncreasers = [0, 0, 1];
  }
}
