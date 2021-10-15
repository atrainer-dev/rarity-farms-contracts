// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IRarity {
  function isApprovedForAll(address owner, address operator)
    external
    view
    returns (bool);

  function ownerOf(uint256) external view returns (address);

  function getApproved(uint256) external view returns (address);
}

abstract contract Resource {
  uint8 public constant DECIMALS = 18;
  bool public locked;
  bool public paused;
  address public owner;

  struct ResourceAttributes {
    uint8 weight;
    uint8[3] pointIncreasers;
    uint8[3] pointDecreasers;
    uint8[6] abilityIncreasers;
    uint8[6] abilityDecreasers;
  }

  ResourceAttributes public attributes;
  IRarity private rarity = IRarity(0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb);

  string public _name;
  string public _symbol;
  uint256 public _totalSupply;

  //Mappings
  mapping(uint256 => uint256) public _balanceOf;
  mapping(address => bool) public minters;
  mapping(uint256 => mapping(uint256 => uint256)) public _transferAllowance;
  mapping(address => mapping(uint256 => uint256)) public burnAllowance;

  // EVENTS
  event Burn(uint256 indexed from, uint256 indexed to, uint256 amount);
  event BurnApproval(uint256 indexed from, address indexed to, uint256 amount);
  event Mint(address indexed from, uint256 indexed to, uint256 amount);
  event Transfer(uint256 indexed from, uint256 indexed to, uint256 amount);
  event Approval(uint256 indexed from, uint256 indexed to, uint256 amount);

  constructor() {
    owner = msg.sender;
    paused = false;
    locked = false;
  }

  function lock() external {
    require(_isOwner(msg.sender), "Must be owner");
    locked = true;
  }

  function pause() external {
    require(_isOwner(msg.sender), "Must be owner");
    paused = true;
  }

  function unpause() external {
    require(_isOwner(msg.sender), "Must be owner");
    paused = false;
  }

  function mint(uint256 summoner, uint256 amount) external {
    require(!paused, "Contract is paused");
    require(minters[msg.sender] == true, "Mint Access Denied");
    _totalSupply += amount;
    _balanceOf[summoner] += amount;
    emit Mint(msg.sender, summoner, amount);
  }

  function addMinter(address minter) external {
    require(msg.sender == owner, "Must be owner");
    minters[minter] = true;
  }

  function removeMinter(address minter) external {
    require(msg.sender == owner, "Must be owner");
    minters[minter] = false;
  }

  function burn(uint256 summoner, uint256 amount) external {
    require(!paused, "Contract is paused");
    require(_isRarityOwner(summoner), "Must be owner");
    _totalSupply -= amount;
    _balanceOf[summoner] -= amount;
    emit Burn(summoner, summoner, amount);
  }

  function burnFrom(uint256 summoner, uint256 amount) external {
    require(!paused, "Contract is paused");
    require(amount <= burnAllowance[msg.sender][summoner], "Burn > Approve");
    _totalSupply -= amount;
    _balanceOf[summoner] -= amount;
    burnAllowance[msg.sender][summoner] -= amount;
    emit Burn(summoner, summoner, amount);
  }

  function burnApprove(
    uint256 summoner,
    address burner,
    uint256 amount
  ) external {
    require(!paused, "Contract is paused");
    require(_isRarityOwner(summoner), "Must be owner");
    burnAllowance[burner][summoner] = amount;
    emit BurnApproval(summoner, burner, amount);
  }

  function setPointIncreasers(
    uint8 hp,
    uint8 mp,
    uint8 stamina
  ) external {
    require(!_isLocked(), "Resource Locked");
    require(_isOwner(msg.sender), "Must be owner");
    attributes.pointIncreasers = [hp, mp, stamina];
  }

  function setPointDecreasers(
    uint8 hp,
    uint8 mp,
    uint8 stamina
  ) external {
    require(!_isLocked(), "Resource Locked");
    require(_isOwner(msg.sender), "Must be owner");
    attributes.pointDecreasers = [hp, mp, stamina];
  }

  function setAbilityIncreasers(
    uint8 str,
    uint8 dex,
    uint8 con,
    uint8 inte,
    uint8 wis,
    uint8 char
  ) external {
    require(!_isLocked(), "Resource Locked");
    require(_isOwner(msg.sender), "Must be owner");
    attributes.abilityIncreasers = [str, dex, con, inte, wis, char];
  }

  function setAbilityDecreasers(
    uint8 str,
    uint8 dex,
    uint8 con,
    uint8 inte,
    uint8 wis,
    uint8 char
  ) external {
    require(!_isLocked(), "Resource Locked");
    require(_isOwner(msg.sender), "Must be owner");
    attributes.abilityDecreasers = [str, dex, con, inte, wis, char];
  }

  function getWeight() external view returns (uint8) {
    return attributes.weight;
  }

  function setWeight(uint8 _weight) external {
    require(!_isLocked(), "Resource Locked");
    require(_isOwner(msg.sender), "Must be owner");
    attributes.weight = _weight;
  }

  function getAbilityIncreasers() external view returns (uint8[6] memory) {
    return attributes.abilityIncreasers;
  }

  function getAbilityDecreasers() external view returns (uint8[6] memory) {
    return attributes.abilityDecreasers;
  }

  function getPointIncreasers() external view returns (uint8[3] memory) {
    return attributes.pointIncreasers;
  }

  function getPointDecreasers() external view returns (uint8[3] memory) {
    return attributes.pointDecreasers;
  }

  function getAttributes()
    external
    view
    returns (
      uint8[3] memory,
      uint8[3] memory,
      uint8[6] memory,
      uint8[6] memory,
      uint8
    )
  {
    return (
      attributes.pointIncreasers,
      attributes.pointDecreasers,
      attributes.abilityIncreasers,
      attributes.abilityDecreasers,
      attributes.weight
    );
  }

  function setOwner(address _owner) external {
    require(_isOwner(msg.sender), "Must be owner");
    owner = _owner;
  }

  function _isOwner(address addr) internal view returns (bool) {
    return owner == addr;
  }

  // ERC 20 Stuff
  function name() external view returns (string memory) {
    return _name;
  }

  function symbol() external view returns (string memory) {
    return _symbol;
  }

  function decimals() external pure returns (uint8) {
    return DECIMALS;
  }

  function totalSupply() external view returns (uint256) {
    return _totalSupply;
  }

  function balanceOf(uint256 _owner) external view returns (uint256) {
    return _balanceOf[_owner];
  }

  function allowance(uint256 _owner, uint256 spender)
    external
    view
    returns (uint256)
  {
    return _transferAllowance[_owner][spender];
  }

  function approve(
    uint256 from,
    uint256 spender,
    uint256 amount
  ) external returns (bool) {
    require(_isRarityApprovedOrOwner(from), "Must be owner");
    _transferAllowance[from][spender] = amount;
    emit Approval(from, spender, amount);
    return true;
  }

  function transfer(
    uint256 from,
    uint256 to,
    uint256 amount
  ) external returns (bool) {
    require(!paused, "Contract is paused");
    require(_isRarityApprovedOrOwner(from), "Must be owner");
    _transferTokens(from, to, amount);
    return true;
  }

  function transferFrom(
    uint256 executor,
    uint256 from,
    uint256 to,
    uint256 amount
  ) external returns (bool) {
    require(!paused, "Contract is paused");
    require(_isRarityApprovedOrOwner(executor), "Must be owner");
    require(amount <= _transferAllowance[from][executor], "Transfer > Approve");
    _transferTokens(from, to, amount);
    _transferAllowance[from][executor] -= amount;
    return true;
  }

  function _transferTokens(
    uint256 from,
    uint256 to,
    uint256 amount
  ) internal {
    _balanceOf[from] -= amount;
    _balanceOf[to] += amount;
    emit Transfer(from, to, amount);
  }

  function _isRarityOwner(uint256 _summoner) internal view returns (bool) {
    return rarity.ownerOf(_summoner) == msg.sender;
  }

  function _isRarityApproved(uint256 _summoner) internal view returns (bool) {
    return
      rarity.getApproved(_summoner) == msg.sender ||
      rarity.isApprovedForAll(rarity.ownerOf(_summoner), msg.sender);
  }

  function _isRarityApprovedOrOwner(uint256 _summoner)
    internal
    view
    returns (bool)
  {
    return _isRarityApproved(_summoner) || _isRarityOwner(_summoner);
  }

  function _isLocked() internal view returns (bool) {
    return locked == true;
  }
}
