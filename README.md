# ERC20 Swapper

This project shows my implementation of a swapper contract that uses Openzeppelin's `TransparentUpgradeableProxy`, and call UniswapV2 `swapExactETHForTokens` to swap ETH to an ERC20 token.

The swapper will swap ETH for [PEPE (0x5e2f3b76cD5df52BBf4bcB9f50003bf769742dc9)](https://sepolia.etherscan.io/token/0x5e2f3b76cD5df52BBf4bcB9f50003bf769742dc9) but you can swap other ERC20 tokens.

The implementation contract inherit from this interface:
```
interface IERC20Swapper {
    /// @dev swaps the `msg.value` Ether to at least `minAmount` of tokens in `address`, or reverts
    /// @param token The address of ERC-20 token to swap
    /// @param minAmount The minimum amount of tokens transferred to msg.sender
    /// @return The actual amount of transferred tokens
    function swapEtherToToken(address token, uint minAmount) external payable returns (uint);
}
```

## Deployed Address
I deployed the contract on [Sepolia](https://chainlist.org/chain/11155111) using [this deploy script](https://github.com/fabriziogianni7/erc20-swapper/blob/main/scripts/deploy.ts).

the deployed address is: `0xC86a8eebEb5c500c34f1d253CC8C3F79723986A3`

## Testing
Tests are [in this file](https://github.com/fabriziogianni7/erc20-swapper/blob/main/test/testSwapper.ts)https://github.com/fabriziogianni7/erc20-swapper/blob/main/test/testSwapper.ts.

To run tests open the cli at the root of the project and run `npx hardhat test` .

## Using Remix
To use this swapper in remix:
1. go to https://remix.ethereum.org/
2. copypaste [the abi](https://github.com/fabriziogianni7/erc20-swapper/blob/main/utils/swapper.abi)https://github.com/fabriziogianni7/erc20-swapper/blob/main/utils/swapper.abi in a new file
3. go to "Deploy and Run Transaction", paste the contract address (`0xC86a8eebEb5c500c34f1d253CC8C3F79723986A3`) in the input field and click on "At Address"

![Schermata 2024-02-24 alle 09 31 22](https://github.com/fabriziogianni7/erc20-swapper/assets/46995085/5cf9f755-a647-407f-8459-0b1522b298ac)

5. play with the contract. To make the swap, paste the token address (I suggest to swap PEPE `0x5e2f3b76cD5df52BBf4bcB9f50003bf769742dc9`) and the minimum amount. Remember that you need to send some ETH to the contract.

## Environment Variables & constants
The contract has its environment variables set for Sepolia. You'll find [constants here](https://github.com/fabriziogianni7/erc20-swapper/blob/main/utils/constants.ts) and a `.env.example` [here](https://github.com/fabriziogianni7/erc20-swapper/blob/main/.env.example)
