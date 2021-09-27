//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Rarity.sol";
import "./Ownable.sol";
import "./Pausable.sol";

abstract contract RERC20 is Rarity, Ownable, Pausable {
  using SafeMath for uint256;
  string public name;
  string public symbol;
  uint256 public totalSupply = 0;
  uint8 public constant decimals = 18;

  mapping(uint256 => uint256) public balanceOf;
  mapping(uint256 => mapping(uint256 => uint256)) public transferAllowance;

  event Transfer(uint256 indexed from, uint256 indexed to, uint256 amount);
  event TransferApproval(
    uint256 indexed from,
    uint256 indexed to,
    uint256 amount
  );

  constructor() Rarity() Ownable() Pausable() {}

  function approve(
    uint256 from,
    uint256 spender,
    uint256 amount
  ) external returns (bool) {
    require(_isRarityApprovedOrOwner(from), "Must be owner");
    transferAllowance[from][spender] = amount;

    emit TransferApproval(from, spender, amount);
    return true;
  }

  function transfer(
    uint256 from,
    uint256 to,
    uint256 amount
  ) external returns (bool) {
    require(!_isPaused(), "Contract is paused");
    require(_isRarityApprovedOrOwner(from), "Must be owner");
    _transferTokens(from, to, amount);
    return true;
  }

  function transferFrom(
    uint256 executor,
    uint256 from,
    uint256 to,
    uint256 amount
  ) external returns (bool) {
    require(!_isPaused(), "Contract is paused");
    require(_isRarityApprovedOrOwner(executor), "Must be owner");
    uint256 spender = executor;
    uint256 allowance = transferAllowance[from][spender];
    require(amount <= allowance, "Transfer amount greater than approval");
    _transferTokens(from, to, amount);
    transferAllowance[from][spender] = allowance.sub(amount);
    return true;
  }

  function _transferTokens(
    uint256 from,
    uint256 to,
    uint256 amount
  ) internal {
    balanceOf[from] = balanceOf[from].sub(amount);
    balanceOf[to] = balanceOf[to].add(amount);

    emit Transfer(from, to, amount);
  }

  function setOwner(address _owner) external returns (bool) {
    require(_isOwner(msg.sender), "Must be owner");
    _setOwner(_owner);
    return true;
  }
}
