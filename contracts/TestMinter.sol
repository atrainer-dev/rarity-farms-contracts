//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract TestMinter {
  string _name = "Apple";
  string _symbol = "APPLE";
  uint8 _decimals = 18;
  uint256 _totalSupply;
  mapping(uint256 => uint256) public _balanceOf;
  mapping(address => bool) public minters;

  struct Attributes {
    bool paused;
  }
  Attributes public attributes;
  event Mint(address indexed from, uint256 indexed to, uint256 amount);

  constructor() {
    minters[msg.sender] = true;
    attributes.paused = false;
  }

  function mint(uint256 summoner, uint256 amount) external {
    require(!attributes.paused, "Contract is paused");
    require(minters[msg.sender] == true, "Mint Access Denied");
    _totalSupply += amount;
    _balanceOf[summoner] += amount;
    emit Mint(msg.sender, summoner, amount);
  }
}
