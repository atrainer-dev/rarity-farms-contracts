//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./Base.sol";

abstract contract RarityBurnable is RarityERC20 {
  using SafeMath for uint256;

  mapping(address => bool) public burners;

  event Burn(uint256 indexed from, uint256 indexed to, uint256 amount);

  function _burn(uint256 dst, uint256 amount) internal {
    require(burners[msg.sender] == true, "Mint Access Denied");
    uint256 balance = balanceOf[dst];
    require(balance >= amount, "Balance too low");
    totalSupply = totalSupply.sub(amount);
    balanceOf[dst] = balance.sub(amount);
    emit Burn(dst, dst, amount);
  }

  function _addBurner(address burner) internal {
    require(msg.sender == owner, "Must be owner");
    burners[burner] = true;
  }

  function _removeBurner(address burner) internal {
    require(msg.sender == owner, "Must be owner");
    burners[burner] = false;
  }
}
