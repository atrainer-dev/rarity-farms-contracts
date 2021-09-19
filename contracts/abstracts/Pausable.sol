//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

abstract contract Pausable {
  bool public paused;
  mapping(address => bool) public pausers;

  constructor() {
    paused = false;
    pausers[msg.sender] = true;
  }

  function _isPaused() internal view returns (bool) {
    return paused == true;
  }

  function pause() external returns (bool) {
    require(pausers[msg.sender], "Pause denied");
    _pause();
    return true;
  }

  function unpause() external returns (bool) {
    require(pausers[msg.sender], "Unpause denied");
    _unpause();
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

  function _pause() internal {
    paused = true;
  }

  function _unpause() internal {
    paused = false;
  }
}
