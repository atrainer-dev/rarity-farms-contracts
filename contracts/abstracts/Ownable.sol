//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

abstract contract Ownable {
  address public owner;

  constructor(address _owner) {
    owner = _owner;
  }

  function _isOwner(address addr) internal view returns (bool) {
    return owner == addr;
  }

  function _setOwner(address addr) internal returns (bool) {
    owner = addr;
    return true;
  }
}
