//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Corn is ERC20, Ownable, Pausable, ERC20Burnable {
  IERC20 public farmer;

  constructor() ERC20("RarityFarms-Corn", "CORN") {
    console.log("Deploying Corn contract");
  }

  function mint(address _nft) public {
    require(msg.sender != address(farmer), "Only the farmer can mint");
    _mint(_nft, 1 * 1e18);
  }

  function setFarmer(IERC20 _farmer) public onlyOwner {
    farmer = _farmer;
  }
}
