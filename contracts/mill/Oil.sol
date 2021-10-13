//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../abstracts/Resource.sol";

contract Oil is Resource {
  constructor() Resource() {
    _name = "Oil";
    _symbol = "OIL";

    attributes.weight = 5;
  }
}
