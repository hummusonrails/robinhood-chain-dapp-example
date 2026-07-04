// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BasketToken} from "./BasketToken.sol";

// permissionless factory for stock token index baskets
contract BasketFactory {
    address[] private _baskets;

    mapping(address basket => bool) public isBasket;

    event BasketCreated(
        address indexed basket, address indexed creator, string name, string symbol
    );

    // deploys a new basket token and registers it
    function createBasket(
        string calldata name,
        string calldata symbol,
        BasketToken.Component[] calldata components,
        uint256 maxPriceAge
    ) external returns (address basket) {
        basket = address(new BasketToken(name, symbol, components, maxPriceAge));
        _baskets.push(basket);
        isBasket[basket] = true;
        emit BasketCreated(basket, msg.sender, name, symbol);
    }

    function basketCount() external view returns (uint256) {
        return _baskets.length;
    }

    function basketAt(uint256 index) external view returns (address) {
        return _baskets[index];
    }

    function allBaskets() external view returns (address[] memory) {
        return _baskets;
    }
}
