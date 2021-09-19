//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./RERC20.sol";
import "./Mintable.sol";
import "./Burnable.sol";

abstract contract Crop is RERC20, RarityBurnable, RarityMintable {
  using SafeMath for uint256;

  constructor() {}

  function mint(uint256 summoner, uint256 amount) external returns (bool) {
    require(minters[msg.sender] == true, "Mint Access Denied");
    _mint(summoner, amount);
    return true;
  }

  function addMinter(address minter) external returns (bool) {
    require(msg.sender == owner, "Must be owner");
    _addMinter(minter);
    return true;
  }

  function removeMinter(address minter) external returns (bool) {
    require(msg.sender == owner, "Must be owner");
    _removeMinter(minter);
    return true;
  }

  function burn(uint256 summoner, uint256 amount) external returns (bool) {
    require(_isRarityOwner(summoner), "Must be owner");
    _burn(summoner, amount);
    return true;
  }

  function burnFrom(uint256 summoner, uint256 amount) external returns (bool) {
    uint256 allowance = burnAllowance[msg.sender][summoner];
    require(amount <= allowance, "Requested Burn greater than approval");
    _burn(summoner, amount);
    burnAllowance[msg.sender][summoner] = allowance.sub(amount);
    return true;
  }

  function burnApprove(
    uint256 summoner,
    address burner,
    uint256 amount
  ) external returns (bool) {
    require(_isRarityOwner(summoner), "Must be owner");
    _burnApprove(summoner, burner, amount);
    return true;
  }

  function setRarity(RarityAddresses memory _rarity) external returns (bool) {
    require(owner == msg.sender, "Must be owner");
    _setRarityAddresses(_rarity);
    return true;
  }
}
