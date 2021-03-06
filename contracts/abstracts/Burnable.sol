// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./RERC20.sol";

abstract contract RarityBurnable is RERC20 {
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
    uint256 balance = _balanceOf[dst];
    require(balance >= amount, "Balance too low");
    _totalSupply -= amount;
    _balanceOf[dst] = balance - amount;
    emit Burn(dst, dst, amount);
  }
}
