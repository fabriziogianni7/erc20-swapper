// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IUniswapV2Factory} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {IERC20Swapper} from "./interfaces/IERC20Swapper.sol";
import {IUniswapV2Router02} from "./interfaces/IUniswapV2Router02.sol";
import {IUniswapV2Pair} from "./interfaces/IUniswapV2Pair.sol";

contract ERC20Swapper is IERC20Swapper {

    error notValidSwapToken(address token);
    error notEnoughLiquidityInPool();
    error swapFailed(string reason);


    IUniswapV2Router02 router =
        IUniswapV2Router02(0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008);
    
    bool locked = false;

    /**
     @notice impeeding potential attackers from calling our swap recursively
     @notice while the attacker is not incentivated to make a reentrancy attack in this case (he need to send ETH everytime he call swapEtherToToken), we are trusting a 3rd party contract (the router) and we may be subject to changes of state on that contract.
     */ 
    modifier avoidReentrancy() {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }

    constructor() {}

    ////////////////////////////// SWAP //////////////////////////////
    /**
    @notice revert by default is the swapped amount is lower than minAmount
     */
    function swapEtherToToken(
        address token,
        uint minAmount
    ) external payable override avoidReentrancy() returns (uint) {
        if (!_isTokenSwappable(token)){
            revert notValidSwapToken(token);
        }
        if (!_hasPairLiquidityForSwap(token,minAmount)){
            revert notEnoughLiquidityInPool();
        }

        address WETH = router.WETH();

        address[] memory path = new address[](2);
        path[0] = WETH;
        path[1] = token;

        try router.swapExactETHForTokens{value: msg.value}(
            minAmount,
            path,
            msg.sender,
            block.timestamp
        ) returns (uint[] memory amounts) {
            return amounts[amounts.length - 1];
        }catch Error(string memory reason) {
            revert swapFailed(reason);
        } catch (bytes memory) {
            revert("Unknown error occurred");
        }
    }

    ////////////////////////////// INTERNAL FUNCTIONS //////////////////////////////
    function _isTokenSwappable(address token) internal view returns (bool) {
        address WETH = router.WETH();
        IUniswapV2Factory factory = IUniswapV2Factory(router.factory());
        if (factory.getPair(WETH, token) == address(0)) {
            return false;
        }
        return true;
    }

    function _hasPairLiquidityForSwap(address token, uint minAmount) internal view returns (bool) {
        if (!_isTokenSwappable(token)){
            revert notValidSwapToken(token);
        }
        address WETH = router.WETH();
        IUniswapV2Factory factory = IUniswapV2Factory(router.factory());
        IUniswapV2Pair pair = IUniswapV2Pair(factory.getPair(WETH,token));

        address token0 = pair.token0();
        (uint112 reserve0, uint112 reserve1,)  = pair.getReserves();

        if (token0 == token){
            return _checkLiquidity(minAmount,reserve0);
        }else{
            return _checkLiquidity(minAmount,reserve1);
        }
    }

    function _checkLiquidity(uint minAmount, uint reserve) pure internal returns(bool){
        if (minAmount > reserve){
                return false;
            }
            return true;
    }


    ////////////////////////////// PUBLIC GETTERS //////////////////////////////
    function getAmountsOut(
        uint amountIn,
        address[] memory path
    ) public view returns (uint[] memory) {
        if (!_isTokenSwappable(path[1])){
            uint[] memory zeroOut = new uint[](2);
            zeroOut[0]=amountIn;
            zeroOut[1]=0;
            return zeroOut;
        }
        return router.getAmountsOut(amountIn, path);
    }

    function getRouterFactory() public view returns (address) {
        return router.factory();
    }

    function getRouterWETH() public view returns (address) {
        return router.WETH();
    }
}
