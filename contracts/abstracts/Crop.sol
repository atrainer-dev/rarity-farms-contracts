// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./RERC20.sol";
import "./Mintable.sol";
import "./Burnable.sol";

abstract contract Crop is RERC20, RarityBurnable, RarityMintable {
  using SafeMath for uint256;

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
    burnAllowance[msg.sender][summoner] = allowance.sub(amount);
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
}
