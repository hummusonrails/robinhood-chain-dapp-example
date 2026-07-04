// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {BasketFactory} from "../src/BasketFactory.sol";
import {BasketToken} from "../src/BasketToken.sol";
import {MockStockToken} from "../src/mocks/MockStockToken.sol";
import {MockPriceFeed} from "../src/mocks/MockPriceFeed.sol";

contract BasketFactoryTest is Test {
    BasketFactory internal factory;
    MockStockToken internal tsla;
    MockPriceFeed internal tslaFeed;

    address internal alice = makeAddr("alice");

    function setUp() public {
        factory = new BasketFactory();
        tsla = new MockStockToken("Tesla", "TSLA");
        tslaFeed = new MockPriceFeed(8, "RHTSLA / USD", 400e8);
    }

    function _components() internal view returns (BasketToken.Component[] memory c) {
        c = new BasketToken.Component[](1);
        c[0] = BasketToken.Component(address(tsla), address(tslaFeed), 1e18);
    }

    function test_createBasket_deploysAndRegisters() public {
        vm.prank(alice);
        address basket = factory.createBasket("Solo TSLA", "SOLO", _components(), 3 days);

        assertTrue(factory.isBasket(basket));
        assertEq(factory.basketCount(), 1);
        assertEq(factory.basketAt(0), basket);
        assertEq(factory.allBaskets()[0], basket);

        BasketToken token = BasketToken(basket);
        assertEq(token.name(), "Solo TSLA");
        assertEq(token.symbol(), "SOLO");
        assertEq(token.factory(), address(factory));
    }

    function test_createBasket_emitsEvent() public {
        // basket address is not known ahead of time so only check indexed creator and data
        vm.expectEmit(false, true, false, true);
        emit BasketFactory.BasketCreated(address(0), alice, "Solo TSLA", "SOLO");
        vm.prank(alice);
        factory.createBasket("Solo TSLA", "SOLO", _components(), 3 days);
    }

    function test_createBasket_multiple() public {
        factory.createBasket("One", "ONE", _components(), 3 days);
        factory.createBasket("Two", "TWO", _components(), 3 days);
        assertEq(factory.basketCount(), 2);
        assertTrue(factory.basketAt(0) != factory.basketAt(1));
    }

    function test_createBasket_propagatesValidation() public {
        BasketToken.Component[] memory none = new BasketToken.Component[](0);
        vm.expectRevert(BasketToken.EmptyComponents.selector);
        factory.createBasket("Empty", "EMP", none, 3 days);
    }

    function test_isBasket_falseForUnknown() public view {
        assertFalse(factory.isBasket(address(0xdead)));
    }
}
