//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../../abstracts/Resource.sol";

contract Strawberry is Resource {
  constructor() Resource() {
    _name = "Strawberry";
    _symbol = "STRAWBERRY";

    attributes.weight = 1;
    attributes.pointIncreasers = [1, 0, 0];
  }
}
