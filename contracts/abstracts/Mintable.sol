// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./RERC20.sol";

abstract contract RarityMintable is RERC20 {
  mapping(address => bool) public minters;

  event Mint(uint256 indexed from, uint256 indexed to, uint256 amount);

  function _mint(uint256 dst, uint256 amount) internal {
    _totalSupply += amount;
    _balanceOf[dst] += amount;
    emit Mint(dst, dst, amount);
  }

  function _addMinter(address minter) internal {
    minters[minter] = true;
  }

  function _removeMinter(address minter) internal {
    minters[minter] = false;
  }
}
