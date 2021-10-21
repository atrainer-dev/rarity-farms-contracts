// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IRarity {
  function ownerOf(uint256) external view returns (address);
}

interface IRarityRandomCodex {
  function d20(uint256) external view returns (uint256);
}

interface IResource {
  function burnFrom(uint256 summoner, uint256 amount) external;
}

abstract contract BurnCompetition {
  address public owner;
  IRarityRandomCodex private constant RANDOM =
    IRarityRandomCodex(0x7426dBE5207C2b5DaC57d8e55F0959fcD99661D4);
  IRarity private constant RARITY =
    IRarity(0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb);

  uint256 private constant DAY = 1 days;
  uint256 public startDate;
  uint256 public endDate;

  mapping(uint256 => uint256) public scores;
  uint256[] public summoners;

  IResource public resource;

  // Events
  event Score(uint256 indexed _summoner, uint256 _roll, uint256 _amount);
  event Claim(uint256 indexed _summoner, address claimer, uint256 amount);
  event Withdrawl(address claimer, uint256 amount);

  constructor(
    IResource _resource,
    uint256 _startDate,
    uint256 _endDate
  ) {
    resource = _resource;
    startDate = _startDate;
    endDate = _endDate;
    owner = msg.sender;
  }

  receive() external payable {}

  function score(uint256 _summoner, uint256 amount) external {
    require(block.timestamp > startDate, "Competition not started");
    require(block.timestamp < endDate, "Competition closed");
    require(_isRarityOwner(_summoner), "Must own NFT");
    uint256 currentScore = scores[_summoner];
    resource.burnFrom(_summoner, amount);
    if (currentScore < 1) {
      summoners.push(_summoner);
    }
    uint256 roll = RANDOM.d20(_summoner) + 1;
    scores[_summoner] += roll * amount;
    emit Score(_summoner, roll, amount);
  }

  function claim(uint256 _summoner) external payable {
    require(block.timestamp > endDate, "Competition not over");
    require(_isRarityOwner(_summoner), "Must own NFT");
    uint256 highScore = 0;
    uint256 scoresLength = summoners.length;
    for (uint256 x = 0; x < scoresLength; x++) {
      if (scores[summoners[x]] > highScore) {
        highScore = scores[summoners[x]];
      }
    }
    require(scores[_summoner] == highScore, "Not the winner");
    payable(msg.sender).transfer(address(this).balance);
    emit Claim(_summoner, msg.sender, address(this).balance);
  }

  function withdrawl() external payable {
    require(owner == msg.sender, "Must be owner");
    require(
      block.timestamp < startDate || block.timestamp > endDate + (7 * DAY),
      "Cannot withdrawl"
    );
    payable(msg.sender).transfer(address(this).balance);
    emit Withdrawl(msg.sender, address(this).balance);
  }

  function getSummoners() external view returns (uint256[] memory) {
    return summoners;
  }

  function _isRarityOwner(uint256 _summoner) internal view returns (bool) {
    return RARITY.ownerOf(_summoner) == msg.sender;
  }
}
