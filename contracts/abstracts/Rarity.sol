//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../integration/rarity_interfaces.sol";

interface rarity_random_codex {
  function d20(uint256) external view returns (uint256);
}

abstract contract Rarity {
  rarity_manifested constant _rm =
    rarity_manifested(0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb);
  rarity_attributes constant _attr =
    rarity_attributes(0xB5F5AF1087A8DA62A23b08C00C6ec9af21F397a1);
  rarity_skills constant _skills =
    rarity_skills(0x51C0B29A1d84611373BA301706c6B4b72283C80F);
  rarity_gold constant _gold =
    rarity_gold(0x2069B76Afe6b734Fb65D1d099E7ec64ee9CC76B2);
  rarity_mat1 constant _mat1 =
    rarity_mat1(0x2A0F1cB17680161cF255348dDFDeE94ea8Ca196A);
  rarity_item1 constant _items1 =
    rarity_item1(0xf41270836dF4Db1D28F7fd0935270e3A603e78cC);
  rarity_names constant _names =
    rarity_names(0xc73e1237A5A9bA5B0f790B6580F32D04a727dc19);

  rarity_random_codex constant _random =
    rarity_random_codex(0x7426dBE5207C2b5DaC57d8e55F0959fcD99661D4);

  constructor() {}

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

  function _getRarity() internal pure returns (rarity_manifested) {
    return _rm;
  }

  function _getRarityAttributes() internal pure returns (rarity_attributes) {
    return _attr;
  }

  function _getRarityRandom() internal pure returns (rarity_random_codex) {
    return _random;
  }
}
