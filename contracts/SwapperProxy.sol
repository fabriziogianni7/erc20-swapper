// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import { ERC20Swapper } from "./ERC20Swapper.sol";

contract SwapperProxy is TransparentUpgradeableProxy {
  constructor(
    address _implementation
  ) TransparentUpgradeableProxy(_implementation, msg.sender, "") {}

  function getImplementation() public view returns (address) {
    return _implementation();
  }

  receive() external payable {}
}
