# Production Contracts

- [Corn](https://ftmscan.com/address/0x622D3F10cC539306306D64ad6cb56Bd44B984547#code)
- [Wheat](https://ftmscan.com/address/0x292F9f1f3eF79d9989949df80ABedD6b017bd7A8#code)
- [Beans](https://ftmscan.com/address/0x25d57C90B5ce23317D6E997e207D8BB096B55DBB#code)
- [Barley](https://ftmscan.com/address/0x7eB37920c52AE4c5e3E0B0BBF2303741672705e3#code)
- [Beginner Farm](https://ftmscan.com/address/0x93705e6d32097A56602eAa433fce73F5F94E1d33#code)

# Installation

```
npm install
npx hardhat compile
```

# Deploy Beginner Farm

```
npx hardhat run scripts/beginnerFarm.js --network localhost
```

# Testing

```
npx hardhat node --fork https://rpc.ftm.tools
```

Open New Terminal

```
npx hardhat test --network localhost
```
