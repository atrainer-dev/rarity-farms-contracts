//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./Rarity.sol";
import "./Ownable.sol";

abstract contract Disaster is Rarity, Ownable {
  using SafeMath for uint256;
  using SafeMath for uint32;

  uint256 public hp;
  uint256 public damage;

  constructor(RarityAddresses memory _rarity, uint256 _hp)
    Rarity(_rarity)
    Ownable()
  {}
}
