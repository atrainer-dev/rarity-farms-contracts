//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IRarity {
  function level(uint256) external view returns (uint256);

  function getApproved(uint256) external view returns (address);

  function ownerOf(uint256) external view returns (address);

  function adventure(uint256 _summoner) external;
}

interface IRarityAttributes {
  function ability_scores(uint256)
    external
    view
    returns (
      uint32,
      uint32,
      uint32,
      uint32,
      uint32,
      uint32
    );
}

abstract contract Rarity {
  address public rarityAddress;
  address public rarityAttributesAddress;
  address public raritySkillsAddress;
  address public rarityGoldAddress;

  struct RarityAddresses {
    address rarity;
    address attributes;
    address skills;
    address gold;
  }

  constructor(RarityAddresses memory addresses) {
    rarityAddress = addresses.rarity;
    rarityAttributesAddress = addresses.attributes;
    raritySkillsAddress = addresses.skills;
    rarityGoldAddress = addresses.gold;
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

  function _getRarityAttributes() internal view returns (IRarityAttributes) {
    return IRarityAttributes(rarityAttributesAddress);
  }

  function _setRarityAddresses(RarityAddresses memory _addresses)
    internal
    returns (bool)
  {
    rarityAddress = _addresses.rarity;
    rarityAttributesAddress = _addresses.attributes;
    raritySkillsAddress = _addresses.skills;
    rarityGoldAddress = _addresses.gold;
    return true;
  }
}
