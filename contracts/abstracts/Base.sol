//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface rarity {
  function level(uint256) external view returns (uint256);

  function getApproved(uint256) external view returns (address);

  function ownerOf(uint256) external view returns (address);
}

abstract contract RarityERC20 {
  using SafeMath for uint256;
  uint8 public constant decimals = 18;

  address public owner;
  uint256 public totalSupply = 0;

  rarity constant rm = rarity(0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb);

  mapping(uint256 => uint256) public balanceOf;
  mapping(uint256 => mapping(uint256 => uint256)) public allowance;

  event Transfer(uint256 indexed from, uint256 indexed to, uint256 amount);
  event Approval(uint256 indexed from, uint256 indexed to, uint256 amount);

  constructor(address _owner) {
    owner = _owner;
  }

  function _isOwner(uint256 _summoner) internal view returns (bool) {
    return rm.ownerOf(_summoner) == msg.sender;
  }

  function _isApproved(uint256 _summoner) internal view returns (bool) {
    return rm.getApproved(_summoner) == msg.sender;
  }

  function _isApprovedOrOwner(uint256 _summoner) internal view returns (bool) {
    return _isApproved(_summoner) || _isOwner(_summoner);
  }

  function transfer(
    uint256 from,
    uint256 to,
    uint256 amount
  ) external returns (bool) {
    require(_isApprovedOrOwner(from), "Not approved or owner");
    _transferTokens(from, to, amount);
    return true;
  }

  function transferFrom(
    uint256 executor,
    uint256 from,
    uint256 to,
    uint256 amount
  ) external returns (bool) {
    require(_isApprovedOrOwner(executor), "Not approved or owner");
    uint256 spender = executor;
    uint256 spenderAllowance = allowance[from][spender];

    if (spender != from && spenderAllowance != type(uint256).max) {
      uint256 newAllowance = spenderAllowance - amount;
      allowance[from][spender] = newAllowance;

      emit Approval(from, spender, newAllowance);
    }

    _transferTokens(from, to, amount);
    return true;
  }

  function _transferTokens(
    uint256 from,
    uint256 to,
    uint256 amount
  ) internal {
    uint256 balanceFrom = balanceOf[from];
    uint256 balanceTo = balanceOf[to];
    require(balanceFrom >= amount, "Balance too low");
    balanceOf[from] = balanceFrom.sub(amount);
    balanceOf[to] = balanceTo.add(amount);
    emit Transfer(from, to, amount);
  }
}
