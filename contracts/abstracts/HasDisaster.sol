// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Pausable.sol";
import "./Ownable.sol";

abstract contract HasDisaster is Pausable, Ownable {
  address public disaster;

  constructor() {
    disaster = address(0);
  }

  function setDisaster(address _addr) external {
    require(_isOwner(msg.sender), "Must be owner");
    _addPauser(_addr);
    disaster = _addr;
    _pause();
  }

  function clearDisaster() external {
    require(
      _isOwner(msg.sender) || _isDisaster(msg.sender),
      "Must be owner or disaster"
    );
    _removePauser(disaster);
    disaster = address(0);
    _unpause();
  }

  function _isDisaster(address _addr) internal view returns (bool) {
    return disaster == _addr;
  }
}
