import { ethers, upgrades } from "hardhat";
import { ERC20Swapper, ERC20Swapper__factory } from "../typechain-types";
import { SEPOLIA_ROUTER_ADDRESS } from "../utils/constants";

/***
 * @command npx hardhat run scripts/deploy.ts --network sepolia
 * @needed to deploy a new proxy, create an escrow and fund it
 */
async function deploy() {
   const [account_1] = await ethers.getSigners();
    const SwapperFactory: ERC20Swapper__factory = await ethers.getContractFactory("ERC20Swapper", account_1)

    const swapper = await upgrades.deployProxy(SwapperFactory, [SEPOLIA_ROUTER_ADDRESS]) as unknown as ERC20Swapper;
    console.log("contract deployed, swapper address:",await swapper.getAddress())
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
