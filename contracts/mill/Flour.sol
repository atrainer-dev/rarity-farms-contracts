//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../abstracts/Resource.sol";

contract Flour is Resource {
  constructor() Resource() {
    _name = "Flour";
    _symbol = "FLOUR";

    attributes.weight = 5;
  }
}
