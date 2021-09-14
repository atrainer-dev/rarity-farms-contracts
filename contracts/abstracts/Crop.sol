//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./Base.sol";
import "./Mintable.sol";
import "./Burnable.sol";

abstract contract Crop is RarityERC20, RarityBurnable, RarityMintable {
  function mint(uint256 summoner, uint256 amount) external {
    require(_isApprovedOrOwner(summoner), "NFT Access Deinied");
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
    require(_isApprovedOrOwner(summoner), "NFT Access Deinied");
    _burn(summoner, amount);
  }

  function addBurner(address burner) external {
    require(msg.sender == owner, "Must be owner");
    _addBurner(burner);
  }

  function removeBurner(address burner) external {
    require(msg.sender == owner, "Must be owner");
    _removeBurner(burner);
  }
}
