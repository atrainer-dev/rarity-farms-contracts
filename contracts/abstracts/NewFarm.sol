//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IRarity {
  function adventure(uint256) external;
}

interface IResource {
  function mint(uint256 summoner, uint256 amount) external;
}

abstract contract NewFarm {
  bool public paused;
  address public owner;
  address public disaster;
  string public name;
  IRarity private constant RARITY =
    IRarity(0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb);

  struct Resource {
    IResource resource;
    uint8 multiplier;
  }

  mapping(address => bool) public pausers;
  mapping(uint8 => Resource) public resources;

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
    disaster = address(0);
    owner = msg.sender;
    paused = false;
    resources[0].resource = IResource(_one);
    resources[0].multiplier = 3;
    resources[1].resource = IResource(_two);
    resources[1].multiplier = 3;
    resources[2].resource = IResource(_three);
    resources[2].multiplier = 3;
    resources[3].resource = IResource(_four);
    resources[3].multiplier = 3;
  }

  function farm(uint256 summoner, uint8 id) external {
    require(id < 4, "Invalid Id");
    _farm(summoner, resources[id]);
  }

  function pause() external {
    require(_isOwner(msg.sender) || pausers[msg.sender], "Must be owner");
    paused = true;
  }

  function unpause() external {
    require(_isOwner(msg.sender) || pausers[msg.sender], "Must be owner");
    paused = false;
  }

  function addPauser(address addr) external {
    require(_isOwner(msg.sender), "Must be owner");
    pausers[addr] = true;
  }

  function removePauser(address addr) external {
    require(_isOwner(msg.sender), "Must be owner");
    pausers[addr] = false;
  }

  /*
  function getMultipliers() external view returns (uint8[4] memory) {
    return attributes.multipliers;
  }
  */

  function setMultipliers(
    uint8 _one,
    uint8 _two,
    uint8 _three,
    uint8 _four
  ) external {
    resources[0].multiplier = _one;
    resources[1].multiplier = _two;
    resources[2].multiplier = _three;
    resources[3].multiplier = _four;
  }

  function setOwner(address _owner) external {
    require(_isOwner(msg.sender), "Must be owner");
    owner = _owner;
  }

  function setDisaster(address _addr) external {
    require(_isOwner(msg.sender), "Must be owner");
    pausers[_addr] = true;
    disaster = _addr;
    paused = true;
  }

  function clearDisaster() external {
    require(
      _isOwner(msg.sender) || disaster == msg.sender,
      "Must be owner or disaster"
    );
    pausers[msg.sender] = false;
    disaster = address(0);
    paused = false;
  }

  function _isOwner(address addr) internal view returns (bool) {
    return owner == addr;
  }

  function _farm(uint256 _summoner, Resource memory _resource) internal {
    require(!paused, "Farm not available");
    RARITY.adventure(_summoner);
    uint256 amount = _resource.multiplier * 1e18;
    _resource.resource.mint(_summoner, amount);
    emit FarmResource(_summoner, address(_resource.resource), amount);
  }
}
