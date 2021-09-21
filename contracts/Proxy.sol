//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./abstracts/Rarity.sol";

contract RarityFarmsProxy is Rarity {
  constructor() Rarity() {}

  function massSummon(uint32[] memory classes) external {
    uint256 arrayLength = classes.length;
    for (uint256 i = 0; i < arrayLength; i++) {
      _getRarity().summon(classes[i]);
    }
  }

  function massAssign(uint32[] memory summoners) external {
    uint256 arrayLength = summoners.length;
    for (uint256 i = 0; i < arrayLength; i++) {
      uint8[6] memory scores = [13, 11, 12, 15, 16, 10];
      uint8[6] memory attrs = _shuffle(scores);
      _getRarityAttributes().point_buy(
        summoners[i],
        attrs[0],
        attrs[1],
        attrs[2],
        attrs[3],
        attrs[4],
        attrs[5]
      );
    }
  }

  function _shuffle(uint8[6] memory attrs)
    internal
    view
    returns (uint8[6] memory)
  {
    for (uint256 i = 0; i < attrs.length; i++) {
      uint256 n = i +
        (uint256(keccak256(abi.encodePacked(block.timestamp))) %
          (attrs.length - i));
      uint8 temp = attrs[n];
      attrs[n] = attrs[i];
      attrs[i] = temp;
    }
    return attrs;
  }
}
