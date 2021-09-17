//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IRarity {
  function level(uint256) external view returns (uint256);

  function getApproved(uint256) external view returns (address);

  function ownerOf(uint256) external view returns (address);
}

abstract contract RERC20 {
  using SafeMath for uint256;
  uint256 public totalSupply = 0;
  uint8 public constant decimals = 18;
  address public owner;
  IRarity rm;

  mapping(uint256 => uint256) public balanceOf;
  mapping(uint256 => mapping(uint256 => uint256)) public transferAllowance;

  event Transfer(uint256 indexed from, uint256 indexed to, uint256 amount);
  event TransferApproval(
    uint256 indexed from,
    uint256 indexed to,
    uint256 amount
  );

  constructor(address _owner, address _rarity) {
    owner = _owner;
    rm = IRarity(_rarity);
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

  function approve(
    uint256 from,
    uint256 spender,
    uint256 amount
  ) external returns (bool) {
    require(_isApprovedOrOwner(from), "Must be owner");
    transferAllowance[from][spender] = amount;

    emit TransferApproval(from, spender, amount);
    return true;
  }

  function transfer(
    uint256 from,
    uint256 to,
    uint256 amount
  ) external returns (bool) {
    require(_isApprovedOrOwner(from), "Must be owner");
    _transferTokens(from, to, amount);
    return true;
  }

  function transferFrom(
    uint256 executor,
    uint256 from,
    uint256 to,
    uint256 amount
  ) external returns (bool) {
    require(_isApprovedOrOwner(executor));
    uint256 spender = executor;
    uint256 spenderAllowance = transferAllowance[from][spender];

    if (spender != from && spenderAllowance != type(uint256).max) {
      uint256 newAllowance = spenderAllowance - amount;
      transferAllowance[from][spender] = newAllowance;

      emit TransferApproval(from, to, amount);
      (from, spender, newAllowance);
    }

    _transferTokens(from, to, amount);
    return true;
  }

  function _transferTokens(
    uint256 from,
    uint256 to,
    uint256 amount
  ) internal {
    balanceOf[from] -= amount;
    balanceOf[to] += amount;

    emit Transfer(from, to, amount);
  }
}
