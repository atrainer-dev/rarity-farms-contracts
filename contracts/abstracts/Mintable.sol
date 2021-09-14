//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./Base.sol";

abstract contract RarityMintable is RarityERC20 {
  using SafeMath for uint256;

  mapping(address => bool) public minters;

  event Mint(uint256 indexed from, uint256 indexed to, uint256 amount);

  function _mint(uint256 dst, uint256 amount) internal {
    require(minters[msg.sender] == true, "Mint Access Denied");
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
