// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import {IUniswapV2Factory} from "node_modules/@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";

import {IERC20Swapper} from "./interfaces/IERC20Swapper.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IUniswapV2Router02} from "./interfaces/IUniswapV2Router02.sol";

contract ERC20Swapper is IERC20Swapper {
    IUniswapV2Router02 router =
        IUniswapV2Router02(0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008);

    constructor() {}

    ////////////////////////////// SWAP //////////////////////////////
    function swapEtherToToken(
        address token,
        uint minAmount
    ) external payable override returns (uint) {
        address WETH = router.WETH();

        address[] memory path = new address[](2);
        path[0] = WETH;
        path[1] = token;

        uint[] memory amounts = router.swapExactETHForTokens{value:msg.value}(
            minAmount,
            path,
            msg.sender,
            block.timestamp + 100
        );
        return amounts[1];
    }
    
    function isTokenSwappable(address token) public view returns (bool) {
        address factoryAddress = router.factory();
        address WETH = router.WETH();
        IUniswapV2Factory factory = IUniswapV2Factory(factoryAddress);
        if (factory.getPair(WETH, token) == address(0)) {
            return false;
        }
        return true;
    }

    function getAmountsOut(
        uint amountIn,
        address[] memory path
    ) public view returns (uint[] memory) {
        return router.getAmountsOut(amountIn, path);
    }

    ////////////////////////////// PUBLIC GETTERS //////////////////////////////
    function getRouterFactory() public view returns (address) {
        return router.factory();
    }

    function getRouterWETH() public view returns (address) {
        return router.WETH();
    }
}
