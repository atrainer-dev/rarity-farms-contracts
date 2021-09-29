# Production Contracts

- [Corn](https://ftmscan.com/address/0x7d81357287fB8fdF763dcB4dF419e95f1fb5B0b6#code)
- [Wheat](https://ftmscan.com/address/0x48c3416229203dA487774a1eeD64ed51480dE84A#code)
- [Beans](https://ftmscan.com/address/0x7e8595472169E8DcB2531d8EC1c6735b6EC95d40#code)
- [Barley](https://ftmscan.com/address/0x24105Bb2C64bed9f9b01308D578FdE53334B850e#code)
- [Beginner Farm](https://ftmscan.com/address/0x8f6C0AB551e0d8F6FFEE224b0c090d0E8DbB3C1D#code)

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
