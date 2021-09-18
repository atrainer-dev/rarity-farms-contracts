//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

abstract contract Pausable {
  bool public paused;
  mapping(address => bool) public pausers;

  constructor() {
    paused = false;
  }

  function _isPaused() internal view returns (bool) {
    return paused == true;
  }

  function _pause() internal returns (bool) {
    require(pausers[msg.sender], "Pause denied");
    paused = true;
    return true;
  }

  function _unpause() internal returns (bool) {
    require(pausers[msg.sender], "Unpause denied");
    paused = false;
    return true;
  }

  function _addPauser(address addr) internal returns (bool) {
    pausers[addr] = true;
    return true;
  }

  function _removePauser(address addr) internal returns (bool) {
    pausers[addr] = false;
    return true;
  }
}
