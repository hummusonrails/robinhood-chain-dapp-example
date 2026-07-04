// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IScaledUIAmount} from "../interfaces/IScaledUIAmount.sol";

// test double for a robinhood chain stock token
// mirrors the erc-20 plus erc-8056 surface, mintable by anyone for local demos
contract MockStockToken is ERC20, IScaledUIAmount {
    uint256 private _uiMultiplier = 1e18;

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    // simulate a corporate action like a stock split
    function setUIMultiplier(uint256 newMultiplier) external {
        _uiMultiplier = newMultiplier;
    }

    function uiMultiplier() external view returns (uint256) {
        return _uiMultiplier;
    }

    function balanceOfUI(address account) external view returns (uint256) {
        return Math.mulDiv(balanceOf(account), _uiMultiplier, 1e18);
    }

    function totalSupplyUI() external view returns (uint256) {
        return Math.mulDiv(totalSupply(), _uiMultiplier, 1e18);
    }

    function newUIMultiplier() external view returns (uint256) {
        return _uiMultiplier;
    }

    function effectiveAt() external pure returns (uint256) {
        return 0;
    }
}
