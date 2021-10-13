//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../abstracts/Resource.sol";

contract Malt is Resource {
  constructor() Resource() {
    _name = "Malt";
    _symbol = "MALT";

    attributes.weight = 5;
  }
}
