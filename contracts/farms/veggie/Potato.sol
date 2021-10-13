//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../../abstracts/Resource.sol";

contract Potato is Resource {
  constructor() Resource() {
    _name = "Potato";
    _symbol = "POTATO";

    attributes.weight = 6;
    attributes.pointIncreasers = [1, 0, 0];
  }
}
