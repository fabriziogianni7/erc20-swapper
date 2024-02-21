// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import {IERC20Swapper} from "./interfaces/IERC20Swapper.sol";

contract ERC20Swapper is IERC20Swapper{

    function swapEtherToToken(address token, uint minAmount) external payable override returns (uint){
        // uses uniswap v3 universal router to make the swap
        // need to do the swap if the returned amount is >= minAmount 
    

    }
}
