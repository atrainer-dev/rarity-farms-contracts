//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IRarity {
  function level(uint256) external view returns (uint256);

  function getApproved(uint256) external view returns (address);

  function ownerOf(uint256) external view returns (address);
}

abstract contract Rarity {
  address public rarityAddress;

  constructor(address _rarity) {
    rarityAddress = _rarity;
  }

  function _isRarityOwner(uint256 _summoner) internal view returns (bool) {
    return _getRarity().ownerOf(_summoner) == msg.sender;
  }

  function _isRarityApproved(uint256 _summoner) internal view returns (bool) {
    return _getRarity().getApproved(_summoner) == msg.sender;
  }

  function _isRarityApprovedOrOwner(uint256 _summoner)
    internal
    view
    returns (bool)
  {
    return _isRarityApproved(_summoner) || _isRarityOwner(_summoner);
  }

  function _getRarity() internal view returns (IRarity) {
    return IRarity(rarityAddress);
  }

  function _setRarity(address _rarity) internal returns (bool) {
    rarityAddress = _rarity;
    return true;
  }
}
