// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

abstract contract Lockable {
  bool public locked = false;

  function _isLocked() internal view returns (bool) {
    return locked == true;
  }
}
