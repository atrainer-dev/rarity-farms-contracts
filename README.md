# Production Contracts

- [Corn](https://ftmscan.com/address/0x8a40e9e2a7Dca2c8BA2e21Ef5B93714F77254357#code)
- [Wheat](https://ftmscan.com/address/0x71A1De363a7E96DDf64f89927da8bd3cB6f2Ba23#code)
- [Beans](https://ftmscan.com/address/0xc20e0079265d1fdbd44089398b625be45e73528f#code)
- [Barley](https://ftmscan.com/address/0xe2C357b6187DD71474F9C78Ac9C3d5C0a9aC8209#code)
- [Beginner Farm](https://ftmscan.com/address/0x1Cee75Ea4d70d350D0A37A29aA47Ba05b64220fD#code)

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
