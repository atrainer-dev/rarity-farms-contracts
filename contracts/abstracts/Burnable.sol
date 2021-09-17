//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./RERC20.sol";

abstract contract RarityBurnable is RERC20 {
  using SafeMath for uint256;

  mapping(address => mapping(uint256 => uint256)) public burnAllowance;

  event Burn(uint256 indexed from, uint256 indexed to, uint256 amount);
  event BurnApproval(uint256 indexed from, address indexed to, uint256 amount);

  function _burnApprove(
    uint256 from,
    address burner,
    uint256 amount
  ) internal returns (bool) {
    burnAllowance[burner][from] = amount;
    emit BurnApproval(from, burner, amount);
    return true;
  }

  function _burn(uint256 dst, uint256 amount) internal {
    uint256 balance = balanceOf[dst];
    require(balance >= amount, "Balance too low");
    totalSupply = totalSupply.sub(amount);
    balanceOf[dst] = balance.sub(amount);
    emit Burn(dst, dst, amount);
  }
}
