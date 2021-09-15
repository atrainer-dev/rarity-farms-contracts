//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./Base.sol";
import "./Mintable.sol";
import "./Burnable.sol";

abstract contract Crop is RarityERC20, RarityBurnable, RarityMintable {
  using SafeMath for uint256;

  function mint(uint256 summoner, uint256 amount) external {
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

  function burn(uint256 summoner, uint256 amount) external returns (bool) {
    require(_isOwner(summoner), "Burn Access Denied");
    _burn(summoner, amount);
    return true;
  }

  function burnFrom(uint256 summoner, uint256 amount) external returns (bool) {
    uint256 allowance = burnAllowance[msg.sender];
    require(allowance >= amount, "Requested Burn greater than approval");
    _burn(summoner, amount);
    burnAllowance[msg.sender] = allowance.sub(amount);
    return true;
  }
}
