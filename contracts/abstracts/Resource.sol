// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./RERC20.sol";
import "./Mintable.sol";
import "./Burnable.sol";
import "./AbilityModifier.sol";
import "./Lockable.sol";
import "./PointModifier.sol";

abstract contract Resource is
  RERC20,
  RarityBurnable,
  RarityMintable,
  Lockable,
  AbilityModifier,
  PointModifier
{
  uint8 public weight;

  constructor(uint8 _weight) {
    weight = _weight;
  }

  function lock() external {
    require(_isOwner(msg.sender), "Must be owner");
    locked = true;
  }

  function mint(uint256 summoner, uint256 amount) external {
    require(!_isPaused(), "Contract is paused");
    require(minters[msg.sender] == true, "Mint Access Denied");
    _mint(summoner, amount);
  }

  function addMinter(address minter) external {
    require(msg.sender == owner, "Must be owner");
    _addMinter(minter);
  }

  function removeMinter(address minter) external {
    require(msg.sender == owner, "Must be owner");
    _removeMinter(minter);
  }

  function burn(uint256 summoner, uint256 amount) external {
    require(!_isPaused(), "Contract is paused");
    require(_isRarityOwner(summoner), "Must be owner");
    _burn(summoner, amount);
  }

  function burnFrom(uint256 summoner, uint256 amount) external {
    require(!_isPaused(), "Contract is paused");
    uint256 allowance = burnAllowance[msg.sender][summoner];
    require(amount <= allowance, "Requested Burn greater than approval");
    _burn(summoner, amount);
    burnAllowance[msg.sender][summoner] = allowance - amount;
  }

  function burnApprove(
    uint256 summoner,
    address burner,
    uint256 amount
  ) external {
    require(!_isPaused(), "Contract is paused");
    require(_isRarityOwner(summoner), "Must be owner");
    _burnApprove(summoner, burner, amount);
  }

  function setPointIncreasers(
    uint8 hp,
    uint8 mp,
    uint8 stamina
  ) external {
    require(!_isLocked(), "Resource Locked");
    require(_isOwner(msg.sender), "Must be owner");
    _setPointIncreasers(hp, mp, stamina);
  }

  function setPointDecreasers(
    uint8 hp,
    uint8 mp,
    uint8 stamina
  ) external {
    require(!_isLocked(), "Resource Locked");
    require(_isOwner(msg.sender), "Must be owner");
    _setPointDecreasers(hp, mp, stamina);
  }

  function setAbilityIncreasers(
    uint8 str,
    uint8 dex,
    uint8 con,
    uint8 inte,
    uint8 wis,
    uint8 char
  ) external {
    require(!_isLocked(), "Resource Locked");
    require(_isOwner(msg.sender), "Must be owner");
    _setAbilityIncreasers(str, dex, con, inte, wis, char);
  }

  function setAbilityDecreasers(
    uint8 str,
    uint8 dex,
    uint8 con,
    uint8 inte,
    uint8 wis,
    uint8 char
  ) external {
    require(!_isLocked(), "Resource Locked");
    require(_isOwner(msg.sender), "Must be owner");
    _setAbilityDecreasers(str, dex, con, inte, wis, char);
  }

  function setWeight(uint8 _weight) external {
    require(!_isLocked(), "Resource Locked");
    require(_isOwner(msg.sender), "Must be owner");
    weight = _weight;
  }
}
