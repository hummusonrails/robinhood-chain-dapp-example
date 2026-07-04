// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// erc-8056 scaled ui amount extension implemented by robinhood chain stock tokens
// raw balances never rebase, splits apply through the multiplier instead
// underlying shares = raw balance * uiMultiplier / 1e18
// docs: https://docs.robinhood.com/chain/stock-tokens/
interface IScaledUIAmount {
    // 18 decimal fixed point where 1e18 equals 1.0
    function uiMultiplier() external view returns (uint256);

    function balanceOfUI(address account) external view returns (uint256);

    function totalSupplyUI() external view returns (uint256);

    // pending multiplier that activates at effectiveAt
    function newUIMultiplier() external view returns (uint256);

    function effectiveAt() external view returns (uint256);
}
