// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IRarity {
  function level(uint256) external view returns (uint256);

  function getApproved(uint256) external view returns (address);

  function ownerOf(uint256) external view returns (address);

  function summoner(uint256)
    external
    view
    returns (
      uint256,
      uint256,
      uint256,
      uint256
    );

  function adventure(uint256) external;
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

interface IRarityRandomCodex {
  function d20(uint256) external view returns (uint256);
}

abstract contract Rarity {
  IRarity constant _rm = IRarity(0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb);
  IRarityAttributes constant _attr =
    IRarityAttributes(0xB5F5AF1087A8DA62A23b08C00C6ec9af21F397a1);
  IRarityRandomCodex constant _random =
    IRarityRandomCodex(0x7426dBE5207C2b5DaC57d8e55F0959fcD99661D4);

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

  function _getRarity() internal pure returns (IRarity) {
    return _rm;
  }

  function _getRarityAttributes() internal pure returns (IRarityAttributes) {
    return _attr;
  }

  function _getRarityRandom() internal pure returns (IRarityRandomCodex) {
    return _random;
  }

  function _getSummonerAttributes(uint256 _summoner)
    internal
    view
    returns (uint32[6] memory)
  {
    (
      uint32 _str,
      uint32 _dex,
      uint32 _con,
      uint32 _int,
      uint32 _wis,
      uint32 _cha
    ) = _getRarityAttributes().ability_scores(_summoner);
    uint32[6] memory scores = [_str, _dex, _con, _int, _wis, _cha];
    return scores;
  }

  function _getSummoner(uint256 _summoner)
    internal
    view
    returns (uint256[4] memory)
  {
    (uint256 _xp, uint256 _log, uint256 _class, uint256 _level) = _getRarity()
      .summoner(_summoner);
    uint256[4] memory result = [_xp, _log, _class, _level];
    return result;
  }
}
