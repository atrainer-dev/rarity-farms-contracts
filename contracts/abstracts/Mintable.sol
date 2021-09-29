// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./RERC20.sol";

abstract contract RarityMintable is RERC20 {
  using SafeMath for uint256;

  mapping(address => bool) public minters;

  event Mint(uint256 indexed from, uint256 indexed to, uint256 amount);

  function _mint(uint256 dst, uint256 amount) internal {
    uint256 balance = balanceOf[dst];
    totalSupply = totalSupply.add(amount);
    balanceOf[dst] = balance.add(amount);
    emit Mint(dst, dst, amount);
  }

  function _addMinter(address minter) internal {
    minters[minter] = true;
  }

  function _removeMinter(address minter) internal {
    minters[minter] = false;
  }
}
