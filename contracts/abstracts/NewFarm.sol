//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./HasDisaster.sol";

interface IRarity {
  function adventure(uint256) external;
}

interface IResource {
  function mint(uint256 summoner, uint256 amount) external;
}

abstract contract NewFarm {
  IRarity constant rarity = IRarity(0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb);

  struct FarmAttributes {
    bool paused;
    address owner;
    address disaster;
    IResource one;
    IResource two;
    IResource three;
    IResource four;
    uint8[4] multipliers;
  }

  FarmAttributes attributes;

  mapping(address => bool) public pausers;

  // Events
  event FarmResource(
    uint256 indexed _summoner,
    address _resource,
    uint256 _amount
  );

  constructor(
    address _one,
    address _two,
    address _three,
    address _four
  ) {
    attributes.one = IResource(_one);
    attributes.two = IResource(_two);
    attributes.three = IResource(_three);
    attributes.four = IResource(_four);
    attributes.disaster = address(0);
    attributes.owner = msg.sender;
    attributes.paused = false;
    attributes.multipliers = [3, 3, 3, 3];
  }

  function farm(uint256 summoner, uint256 id) external {
    require(id < 4, "Invalid Id");
    if (id == 0) {
      _farm(summoner, attributes.one, attributes.multipliers[id]);
    } else if (id == 1) {
      _farm(summoner, attributes.two, attributes.multipliers[id]);
    } else if (id == 2) {
      _farm(summoner, attributes.three, attributes.multipliers[id]);
    } else if (id == 3) {
      _farm(summoner, attributes.four, attributes.multipliers[id]);
    }
  }

  function pause() external {
    require(_isOwner(msg.sender) || pausers[msg.sender], "Must be owner");
    attributes.paused = true;
  }

  function unpause() external {
    require(_isOwner(msg.sender) || pausers[msg.sender], "Must be owner");
    attributes.paused = false;
  }

  function addPauser(address addr) external {
    require(_isOwner(msg.sender), "Must be owner");
    pausers[addr] = true;
  }

  function isPaused() external view returns (bool) {
    return attributes.paused;
  }

  function removePauser(address addr) external {
    require(_isOwner(msg.sender), "Must be owner");
    pausers[addr] = false;
  }

  function getMultipliers() external view returns (uint8[4] memory) {
    return attributes.multipliers;
  }

  function setMultipliers(
    uint8 _one,
    uint8 _two,
    uint8 _three,
    uint8 _four
  ) external {
    attributes.multipliers = [_one, _two, _three, _four];
  }

  function getOwner() external view returns (address) {
    return attributes.owner;
  }

  function setOwner(address _owner) external {
    require(_isOwner(msg.sender), "Must be owner");
    attributes.owner = _owner;
  }

  function getDisaster() external view returns (address) {
    return attributes.disaster;
  }

  function setDisaster(address _addr) external {
    require(_isOwner(msg.sender), "Must be owner");
    pausers[_addr] = true;
    attributes.disaster = _addr;
    attributes.paused = true;
  }

  function clearDisaster() external {
    require(
      _isOwner(msg.sender) || attributes.disaster == msg.sender,
      "Must be owner or disaster"
    );
    pausers[msg.sender] = false;
    attributes.disaster = address(0);
    attributes.paused = false;
  }

  function _isOwner(address addr) internal view returns (bool) {
    return attributes.owner == addr;
  }

  function _farm(
    uint256 _summoner,
    IResource _resource,
    uint256 _multiplier
  ) internal {
    require(!attributes.paused, "Farm not available");
    rarity.adventure(_summoner);
    _resource.mint(_summoner, _multiplier * 1e18);
    emit FarmResource(_summoner, address(_resource), _multiplier * 1e18);
  }
}
