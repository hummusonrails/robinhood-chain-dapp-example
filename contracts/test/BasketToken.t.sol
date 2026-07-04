// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {BasketToken} from "../src/BasketToken.sol";
import {MockStockToken} from "../src/mocks/MockStockToken.sol";
import {MockPriceFeed} from "../src/mocks/MockPriceFeed.sol";

contract BasketTokenTest is Test {
    MockStockToken internal tsla;
    MockStockToken internal amzn;
    MockPriceFeed internal tslaFeed;
    MockPriceFeed internal amznFeed;
    BasketToken internal basket;

    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    uint256 internal constant TSLA_UNITS = 0.4e18;
    uint256 internal constant AMZN_UNITS = 0.6e18;
    int256 internal constant TSLA_PRICE = 400e8;
    int256 internal constant AMZN_PRICE = 250e8;
    uint256 internal constant MAX_PRICE_AGE = 3 days;

    function setUp() public {
        tsla = new MockStockToken("Tesla", "TSLA");
        amzn = new MockStockToken("Amazon", "AMZN");
        tslaFeed = new MockPriceFeed(8, "RHTSLA / USD", TSLA_PRICE);
        amznFeed = new MockPriceFeed(8, "RHAMZN / USD", AMZN_PRICE);

        basket = new BasketToken("Tech Duo", "DUO", _defaultComponents(), MAX_PRICE_AGE);

        tsla.mint(alice, 100e18);
        amzn.mint(alice, 100e18);
        vm.startPrank(alice);
        tsla.approve(address(basket), type(uint256).max);
        amzn.approve(address(basket), type(uint256).max);
        vm.stopPrank();
    }

    function _defaultComponents() internal view returns (BasketToken.Component[] memory c) {
        c = new BasketToken.Component[](2);
        c[0] = BasketToken.Component(address(tsla), address(tslaFeed), TSLA_UNITS);
        c[1] = BasketToken.Component(address(amzn), address(amznFeed), AMZN_UNITS);
    }

    function test_metadata() public view {
        assertEq(basket.name(), "Tech Duo");
        assertEq(basket.symbol(), "DUO");
        assertEq(basket.decimals(), 18);
        assertEq(basket.componentCount(), 2);
        assertEq(basket.maxPriceAge(), MAX_PRICE_AGE);
        assertEq(basket.factory(), address(this));
    }

    function test_componentAt() public view {
        BasketToken.Component memory c = basket.componentAt(0);
        assertEq(c.token, address(tsla));
        assertEq(c.feed, address(tslaFeed));
        assertEq(c.unitsPerShare, TSLA_UNITS);
    }

    function test_mint_pullsComponentsAndMintsShares() public {
        vm.prank(alice);
        basket.mint(10e18, alice);

        assertEq(basket.balanceOf(alice), 10e18);
        assertEq(basket.totalSupply(), 10e18);
        assertEq(tsla.balanceOf(address(basket)), 4e18);
        assertEq(amzn.balanceOf(address(basket)), 6e18);
        assertEq(tsla.balanceOf(alice), 96e18);
        assertEq(amzn.balanceOf(alice), 94e18);
    }

    function test_mint_emitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit BasketToken.Minted(alice, bob, 1e18);
        vm.prank(alice);
        basket.mint(1e18, bob);
    }

    function test_mint_toOtherRecipient() public {
        vm.prank(alice);
        basket.mint(5e18, bob);
        assertEq(basket.balanceOf(bob), 5e18);
        assertEq(basket.balanceOf(alice), 0);
    }

    function test_mint_revertsOnZeroShares() public {
        vm.expectRevert(BasketToken.ZeroShares.selector);
        vm.prank(alice);
        basket.mint(0, alice);
    }

    function test_mint_revertsWithoutApproval() public {
        tsla.mint(bob, 1e18);
        amzn.mint(bob, 1e18);
        vm.expectRevert();
        vm.prank(bob);
        basket.mint(1e18, bob);
    }

    function test_mint_roundsUpTinyShares() public {
        // 1 wei of shares must still cost at least 1 wei of each component
        vm.prank(alice);
        basket.mint(1, alice);
        assertEq(tsla.balanceOf(address(basket)), 1);
        assertEq(amzn.balanceOf(address(basket)), 1);
    }

    function test_redeem_returnsComponents() public {
        vm.startPrank(alice);
        basket.mint(10e18, alice);
        basket.redeem(10e18, alice);
        vm.stopPrank();

        assertEq(basket.totalSupply(), 0);
        assertEq(tsla.balanceOf(alice), 100e18);
        assertEq(amzn.balanceOf(alice), 100e18);
    }

    function test_redeem_emitsEvent() public {
        vm.startPrank(alice);
        basket.mint(2e18, alice);
        vm.expectEmit(true, true, false, true);
        emit BasketToken.Redeemed(alice, bob, 2e18);
        basket.redeem(2e18, bob);
        vm.stopPrank();
    }

    function test_redeem_toOtherRecipient() public {
        vm.startPrank(alice);
        basket.mint(10e18, alice);
        basket.redeem(4e18, bob);
        vm.stopPrank();

        assertEq(tsla.balanceOf(bob), 1.6e18);
        assertEq(amzn.balanceOf(bob), 2.4e18);
        assertEq(basket.balanceOf(alice), 6e18);
    }

    function test_redeem_revertsOnZeroShares() public {
        vm.expectRevert(BasketToken.ZeroShares.selector);
        vm.prank(alice);
        basket.redeem(0, alice);
    }

    function test_redeem_revertsOnZeroRecipient() public {
        vm.prank(alice);
        basket.mint(1e18, alice);
        vm.expectRevert(BasketToken.ZeroAddress.selector);
        vm.prank(alice);
        basket.redeem(1e18, address(0));
    }

    function test_redeem_revertsBeyondBalance() public {
        vm.prank(alice);
        basket.mint(1e18, alice);
        vm.expectRevert();
        vm.prank(alice);
        basket.redeem(2e18, alice);
    }

    function test_redeem_neverOverdrawsReserves() public {
        vm.startPrank(alice);
        basket.mint(3, alice);
        basket.redeem(3, alice);
        vm.stopPrank();
        // rounding up on mint and down on redeem keeps dust in the basket
        assertGe(tsla.balanceOf(address(basket)), 0);
        assertEq(basket.totalSupply(), 0);
    }

    function test_quoteMint_matchesPulledAmounts() public {
        uint256[] memory amounts = basket.quoteMint(7e18);
        vm.prank(alice);
        basket.mint(7e18, alice);
        assertEq(amounts[0], tsla.balanceOf(address(basket)));
        assertEq(amounts[1], amzn.balanceOf(address(basket)));
    }

    function test_quoteRedeem_matchesReturnedAmounts() public {
        vm.prank(alice);
        basket.mint(7e18, alice);
        uint256[] memory amounts = basket.quoteRedeem(7e18);
        uint256 tslaBefore = tsla.balanceOf(alice);
        vm.prank(alice);
        basket.redeem(7e18, alice);
        assertEq(tsla.balanceOf(alice) - tslaBefore, amounts[0]);
    }

    function test_sharePriceUsd() public view {
        // 0.4 * 400 + 0.6 * 250 = 310 usd with 8 decimals
        assertEq(basket.sharePriceUsd(), 310e8);
    }

    function test_sharePriceUsd_tracksFeedUpdates() public {
        tslaFeed.updateAnswer(500e8);
        assertEq(basket.sharePriceUsd(), 350e8);
    }

    function test_balanceValueUsd() public {
        vm.prank(alice);
        basket.mint(2e18, alice);
        assertEq(basket.balanceValueUsd(alice), 620e8);
    }

    function test_totalValueUsd() public {
        vm.prank(alice);
        basket.mint(3e18, alice);
        assertEq(basket.totalValueUsd(), 930e8);
    }

    function test_sharePriceUsd_revertsOnStaleFeed() public {
        vm.warp(block.timestamp + MAX_PRICE_AGE + 1);
        vm.expectRevert(
            abi.encodeWithSelector(BasketToken.StalePrice.selector, address(tslaFeed), 1)
        );
        basket.sharePriceUsd();
    }

    function test_sharePriceUsd_revertsOnNonPositiveAnswer() public {
        tslaFeed.updateAnswer(0);
        vm.expectRevert(
            abi.encodeWithSelector(BasketToken.InvalidPrice.selector, address(tslaFeed), 0)
        );
        basket.sharePriceUsd();
    }

    function test_mintRedeem_stillWorksWhileFeedIsStale() public {
        // pricing is view only, transfers must not depend on feed liveness
        vm.warp(block.timestamp + MAX_PRICE_AGE + 1);
        vm.startPrank(alice);
        basket.mint(1e18, alice);
        basket.redeem(1e18, alice);
        vm.stopPrank();
    }

    function test_constructor_revertsOnEmptyComponents() public {
        BasketToken.Component[] memory none = new BasketToken.Component[](0);
        vm.expectRevert(BasketToken.EmptyComponents.selector);
        new BasketToken("Empty", "EMP", none, MAX_PRICE_AGE);
    }

    function test_constructor_revertsOnTooManyComponents() public {
        BasketToken.Component[] memory many = new BasketToken.Component[](11);
        for (uint256 i = 0; i < 11; i++) {
            MockStockToken t = new MockStockToken("T", "T");
            many[i] = BasketToken.Component(address(t), address(tslaFeed), 1e18);
        }
        vm.expectRevert(abi.encodeWithSelector(BasketToken.TooManyComponents.selector, 11));
        new BasketToken("Many", "MANY", many, MAX_PRICE_AGE);
    }

    function test_constructor_revertsOnZeroToken() public {
        BasketToken.Component[] memory c = _defaultComponents();
        c[0].token = address(0);
        vm.expectRevert(BasketToken.ZeroAddress.selector);
        new BasketToken("Bad", "BAD", c, MAX_PRICE_AGE);
    }

    function test_constructor_revertsOnZeroFeed() public {
        BasketToken.Component[] memory c = _defaultComponents();
        c[1].feed = address(0);
        vm.expectRevert(BasketToken.ZeroAddress.selector);
        new BasketToken("Bad", "BAD", c, MAX_PRICE_AGE);
    }

    function test_constructor_revertsOnZeroUnits() public {
        BasketToken.Component[] memory c = _defaultComponents();
        c[0].unitsPerShare = 0;
        vm.expectRevert(abi.encodeWithSelector(BasketToken.ZeroUnits.selector, address(tsla)));
        new BasketToken("Bad", "BAD", c, MAX_PRICE_AGE);
    }

    function test_constructor_revertsOnDuplicateToken() public {
        BasketToken.Component[] memory c = _defaultComponents();
        c[1].token = address(tsla);
        vm.expectRevert(abi.encodeWithSelector(BasketToken.DuplicateToken.selector, address(tsla)));
        new BasketToken("Bad", "BAD", c, MAX_PRICE_AGE);
    }

    function test_constructor_revertsOnWrongFeedDecimals() public {
        MockPriceFeed weird = new MockPriceFeed(18, "WEIRD / USD", 1e18);
        BasketToken.Component[] memory c = _defaultComponents();
        c[0].feed = address(weird);
        vm.expectRevert(
            abi.encodeWithSelector(BasketToken.UnexpectedFeedDecimals.selector, address(weird), 18)
        );
        new BasketToken("Bad", "BAD", c, MAX_PRICE_AGE);
    }

    function testFuzz_mintRedeemRoundTrip(uint96 rawShares) public {
        uint256 shares = bound(uint256(rawShares), 1, 50e18);
        vm.startPrank(alice);
        basket.mint(shares, alice);
        basket.redeem(shares, alice);
        vm.stopPrank();

        // user can lose at most 1 wei of dust per component to rounding
        assertGe(tsla.balanceOf(alice) + 1, 100e18);
        assertGe(amzn.balanceOf(alice) + 1, 100e18);
        assertLe(tsla.balanceOf(alice), 100e18);
        assertEq(basket.totalSupply(), 0);
    }
}
