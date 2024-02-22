import { expect } from "chai";
import { Signer, parseUnits, parseEther } from "ethers";
import { ethers } from "hardhat";
import { ERC20Swapper, ERC20Swapper__factory, ERC20 } from "../typechain-types";
import * as dotenv from "dotenv";
import { erc20 } from "../typechain-types/factories/@openzeppelin/contracts/token";
import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";
import * as ERC20CJson from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { CORRECT_SEPOLIA_WETH, NOT_SWAPPABLE_TOKEN, SEPOLIA_ROUTER_FACTORY_ADDRESS, TOKEN_TO_SWAP } from "./utils/constants";

dotenv.config();

describe("Test ERC20Swapper Contract", function () {
  let account_1: Signer
  let account_2: Signer
  let account_3: Signer
  let swapper: ERC20Swapper
  let swapperAddress: string
  let swapToken: ERC20 
  beforeEach(async () => {
    [account_1, account_2, account_3] = await ethers.getSigners();

    const SwapperFactory: ERC20Swapper__factory = await ethers.getContractFactory("ERC20Swapper", account_1)
    swapper = await SwapperFactory.deploy()
    swapperAddress = await swapper.getAddress()
    swapToken = new ethers.Contract(TOKEN_TO_SWAP, ERC20CJson.abi, ethers.provider) as unknown as ERC20
  })
  it("testing deployment", async () => {
    expect(await swapToken.getAddress()).equals(TOKEN_TO_SWAP)
    expect(swapperAddress).to.be.a("string")
  })
  it("check that factory contract is the one on sepolia", async () => {
    const routerFactory = await swapper.getRouterFactory()
    expect(routerFactory).equals(SEPOLIA_ROUTER_FACTORY_ADDRESS)
  })
  it("chack that WETH address is the one on sepolia", async () => {
    const WETH = await swapper.getRouterWETH()
    expect(WETH).equals(CORRECT_SEPOLIA_WETH)
  })
  it("test isTokenSwappable", async () => {
    let isSwappable;
    isSwappable = await swapper.isTokenSwappable(TOKEN_TO_SWAP)
    expect(isSwappable).true
    const shouldNotBeSwappable = NOT_SWAPPABLE_TOKEN
    isSwappable = await swapper.isTokenSwappable(shouldNotBeSwappable)
    expect(isSwappable).false
  })
  it("test swap", async () => {
    const WETH = await swapper.getRouterWETH()
    const initialBalance = await ethers.provider.getBalance(account_1)
    const amountToSwap = parseUnits("1", "ether")

    const amountsOut = await swapper.getAmountsOut(amountToSwap, [WETH, TOKEN_TO_SWAP])

    // SWAP
    await swapper.connect(account_1).swapEtherToToken(TOKEN_TO_SWAP, amountsOut[1], { value: amountToSwap });

    const swapTokenBalanceAfterSwap = await swapToken.balanceOf(account_1)
    const ETHbalanceAfterSwap = await ethers.provider.getBalance(account_1)

    expect(swapTokenBalanceAfterSwap).greaterThanOrEqual(amountsOut[1])
    expect(ETHbalanceAfterSwap).lessThan(initialBalance - amountsOut[0])
  })

});
