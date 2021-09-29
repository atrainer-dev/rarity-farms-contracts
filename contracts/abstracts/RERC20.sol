// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Rarity.sol";
import "./Ownable.sol";
import "./Pausable.sol";

interface IRarityFungible {
  event Transfer(uint256 indexed from, uint256 indexed to, uint256 amount);
  event Approval(uint256 indexed from, uint256 indexed to, uint256 amount);

  function name() external view returns (string memory);

  function symbol() external view returns (string memory);

  function decimals() external view returns (uint8);

  function totalSupply() external view returns (uint256);

  function balanceOf(uint256 owner) external view returns (uint256);

  function allowance(uint256 owner, uint256 spender)
    external
    view
    returns (uint256);

  function approve(
    uint256 from,
    uint256 spender,
    uint256 amount
  ) external returns (bool);

  function transfer(
    uint256 from,
    uint256 to,
    uint256 amount
  ) external returns (bool);

  function transferFrom(
    uint256 executor,
    uint256 from,
    uint256 to,
    uint256 amount
  ) external returns (bool);
}

abstract contract RERC20 is IRarityFungible, Rarity, Ownable, Pausable {
  string _name;
  string _symbol;
  uint256 public _totalSupply = 0;
  uint8 public constant _decimals = 18;

  mapping(uint256 => uint256) public _balanceOf;
  mapping(uint256 => mapping(uint256 => uint256)) public _transferAllowance;

  constructor() Rarity() Ownable() Pausable() {}

  function name() external view override returns (string memory) {
    return _name;
  }

  function symbol() external view override returns (string memory) {
    return _symbol;
  }

  function decimals() external view override returns (uint8) {
    return _decimals;
  }

  function totalSupply() external view override returns (uint256) {
    return _totalSupply;
  }

  function balanceOf(uint256 owner) external view override returns (uint256) {
    return _balanceOf[owner];
  }

  function allowance(uint256 owner, uint256 spender)
    external
    view
    override
    returns (uint256)
  {
    return _transferAllowance[owner][spender];
  }

  function approve(
    uint256 from,
    uint256 spender,
    uint256 amount
  ) external override returns (bool) {
    require(_isRarityApprovedOrOwner(from), "Must be owner");
    _transferAllowance[from][spender] = amount;

    emit Approval(from, spender, amount);
    return true;
  }

  function transfer(
    uint256 from,
    uint256 to,
    uint256 amount
  ) external override returns (bool) {
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
  ) external override returns (bool) {
    require(!_isPaused(), "Contract is paused");
    require(_isRarityApprovedOrOwner(executor), "Must be owner");
    uint256 spender = executor;
    uint256 allow = _transferAllowance[from][spender];
    require(amount <= allow, "Transfer amount greater than approval");
    _transferTokens(from, to, amount);
    _transferAllowance[from][spender] = allow - amount;
    return true;
  }

  function _transferTokens(
    uint256 from,
    uint256 to,
    uint256 amount
  ) internal {
    _balanceOf[from] -= amount;
    _balanceOf[to] += amount;

    emit Transfer(from, to, amount);
  }

  function setOwner(address _owner) external returns (bool) {
    require(_isOwner(msg.sender), "Must be owner");
    _setOwner(_owner);
    return true;
  }
}
