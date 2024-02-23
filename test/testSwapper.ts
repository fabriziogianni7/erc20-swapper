import { expect } from "chai";
import { Signer, parseUnits } from "ethers";
import { ethers, upgrades } from "hardhat";
import { ERC20Swapper, ERC20Swapper__factory, ERC20, SwapperProxy } from "../typechain-types";
import * as dotenv from "dotenv";
import * as ERC20CJson from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { NOT_SWAPPABLE_TOKEN, SEPOLIA_ROUTER_ADDRESS, SEPOLIA_ROUTER_FACTORY_ADDRESS, TOKEN_TO_SWAP, TOKEN_WITH_NO_LIQUIDITY, WETH } from "../utils/constants";
dotenv.config();

describe("Test ERC20Swapper Contract", function () {
  let account_1: Signer
  let swapper: ERC20Swapper
  let swapperAddress: string
  let swapToken: ERC20
  let WETH: string
  beforeEach(async () => {
    [account_1] = await ethers.getSigners();


    const SwapperFactory: ERC20Swapper__factory = await ethers.getContractFactory("ERC20Swapper", account_1)
    swapper = await SwapperFactory.deploy()
    await swapper.initialize(SEPOLIA_ROUTER_ADDRESS)
    swapperAddress = await swapper.getAddress()


    swapToken = new ethers.Contract(TOKEN_TO_SWAP, ERC20CJson.abi, ethers.provider) as unknown as ERC20
    WETH = await swapper.getRouterWETH()


  })
  it("testing proxy cloning and functionality", async () => {
    expect(await swapToken.getAddress()).equals(TOKEN_TO_SWAP)
    expect(swapperAddress).to.be.a("string")
  })
  it("test getAmountsOut", async () => {
    const amountToSwap = parseUnits("1", "ether")
    let amountOut;
    amountOut = await swapper.getAmountsOut(amountToSwap, [WETH, TOKEN_TO_SWAP])
    expect(amountOut[1]).greaterThan(0)

    amountOut = await swapper.getAmountsOut(amountToSwap, [WETH, NOT_SWAPPABLE_TOKEN])
    expect(amountOut[1]).equals(0)
  })
  it("test swap", async () => {
    const initialBalance = await ethers.provider.getBalance(account_1)
    const amountToSwap = parseUnits("1", "ether")

    const amountsOut = await swapper.getAmountsOut(amountToSwap, [WETH, TOKEN_TO_SWAP])
    const minAmount = amountsOut[1]

    // SWAP
    await swapper.connect(account_1).swapEtherToToken(TOKEN_TO_SWAP, minAmount, { value: amountToSwap });

    const swapTokenBalanceAfterSwap = await swapToken.balanceOf(account_1)
    const ETHbalanceAfterSwap = await ethers.provider.getBalance(account_1)

    expect(swapTokenBalanceAfterSwap).greaterThanOrEqual(amountsOut[1])
    expect(ETHbalanceAfterSwap).lessThan(initialBalance - amountsOut[0])
  })
  it("test swap - fail case: setting minAmount too high", async () => {
    const amountToSwap = parseUnits("1", "ether")

    const amountsOut = await swapper.getAmountsOut(amountToSwap, [WETH, TOKEN_TO_SWAP])
    const minAmount = amountsOut[1] + 1000_000_000_000_000_000n

    // SWAP
    await expect(swapper.connect(account_1).swapEtherToToken(TOKEN_TO_SWAP, minAmount, { value: amountToSwap })).revertedWithCustomError(swapper, "swapFailed");

  })
  it("test swap - fail case: the token is not tradable (no pools available)", async () => {
    const amountToSwap = parseUnits("1", "ether")

    const minAmount = 1000_000_000_000_000_000n

    // SWAP
    await expect(swapper.connect(account_1).swapEtherToToken(NOT_SWAPPABLE_TOKEN, minAmount, { value: amountToSwap })).revertedWithCustomError(swapper, "notValidSwapToken");

  })
  it("test swap - fail case: the pool has not enough liquidity for the swap", async () => {
    const amountToSwap = parseUnits("1", "ether")

    const minAmount = 1000_000_000_000_000_000n
    // SWAP
    await expect(swapper.connect(account_1).swapEtherToToken(TOKEN_WITH_NO_LIQUIDITY, minAmount, { value: amountToSwap })).revertedWithCustomError(swapper, "notEnoughLiquidityInPool");
  })

});

describe("Test SwapperProxy Contract", function () {
  let account_1: Signer
  let account_2: Signer
  let swapper: ERC20Swapper
  let swapToken: ERC20
  beforeEach(async () => {
    [account_1, account_2] = await ethers.getSigners();
    const SwapperFactory: ERC20Swapper__factory = await ethers.getContractFactory("ERC20Swapper", account_1)

    swapper = await upgrades.deployProxy(SwapperFactory, [SEPOLIA_ROUTER_ADDRESS]) as unknown as ERC20Swapper;

    swapToken = new ethers.Contract(TOKEN_TO_SWAP, ERC20CJson.abi, ethers.provider) as unknown as ERC20
  })
  it("test calling the implementation trough the proxy", async () => {
    const weth = await swapper.connect(account_2).getRouterWETH();
    const factory = await swapper.connect(account_2).getRouterFactory();
    const routerAddr = await swapper.connect(account_2).getRouterAddress();
    expect(weth).equals(WETH)
    expect(factory).equals(SEPOLIA_ROUTER_FACTORY_ADDRESS)
    expect(routerAddr).equals(SEPOLIA_ROUTER_ADDRESS)
  })
  it("test making the swap trough the proxy", async () => {
    const initialBalance = await ethers.provider.getBalance(account_2)

    const amountToSwap = parseUnits("1", "ether")

    const amountsOut = await swapper.getAmountsOut(amountToSwap, [WETH, TOKEN_TO_SWAP])
    const minAmount = amountsOut[1]

    await swapper.connect(account_2).swapEtherToToken(TOKEN_TO_SWAP, minAmount, { value: amountToSwap });

    const swapTokenBalanceAfterSwap = await swapToken.balanceOf(account_2)
    const ETHbalanceAfterSwap = await ethers.provider.getBalance(account_2)
    expect(swapTokenBalanceAfterSwap).greaterThanOrEqual(amountsOut[1])
    expect(ETHbalanceAfterSwap).lessThan(initialBalance - amountsOut[0])
  })
  it("test updating proxy implementation contract", async () => {
    const SwapperFactory: ERC20Swapper__factory = await ethers.getContractFactory("ERC20Swapper", account_1)
    swapper = await upgrades.deployProxy(SwapperFactory, [SEPOLIA_ROUTER_ADDRESS]) as unknown as ERC20Swapper;

    const swapperUpgraded = await upgrades.upgradeProxy(swapper, SwapperFactory) as unknown as ERC20Swapper;

    expect(await swapperUpgraded.getRouterWETH()).equals(WETH)
    expect(await swapper.getAddress()).equals(await swapperUpgraded.getAddress())
  })
})
