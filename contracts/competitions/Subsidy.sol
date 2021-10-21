// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../abstracts/BurnCompetition.sol";

contract Subsidy is BurnCompetition {
  constructor(
    IResource _resource,
    uint256 _start,
    uint256 _end
  ) BurnCompetition(_resource, _start, _end) {}
}
