// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {BasketFactory} from "../../src/BasketFactory.sol";
import {BasketToken} from "../../src/BasketToken.sol";
import {AggregatorV3Interface} from "../../src/interfaces/AggregatorV3Interface.sol";
import {IScaledUIAmount} from "../../src/interfaces/IScaledUIAmount.sol";

// fork tests against robinhood chain mainnet, chain id 4663
// run with: pnpm run test:fork
// token addresses: https://docs.robinhood.com/chain/contracts/
// feed addresses: https://docs.chain.link/data-feeds/price-feeds/addresses?network=robinhood
contract BasketMainnetForkTest is Test {
    address internal constant TSLA = 0x322F0929c4625eD5bAd873c95208D54E1c003b2d;
    address internal constant NVDA = 0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC;
    address internal constant AAPL = 0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9;

    address internal constant TSLA_FEED = 0x4A1166a659A55625345e9515b32adECea5547C38;
    address internal constant NVDA_FEED = 0x379EC4f7C378F34a1B47E4F3cbeBCbAC3E8E9F15;
    address internal constant AAPL_FEED = 0x6B22A786bAa607d76728168703a39Ea9C99f2cD0;

    // stock feeds update 24/5 so allow a long weekend before calling them stale
    uint256 internal constant MAX_PRICE_AGE = 4 days;

    address internal alice = makeAddr("alice");

    BasketFactory internal factory;
    BasketToken internal basket;

    function setUp() public {
        string memory rpc =
            vm.envOr("ROBINHOOD_RPC_URL", string("https://rpc.mainnet.chain.robinhood.com"));
        vm.createSelectFork(rpc);
        assertEq(block.chainid, 4663);

        factory = new BasketFactory();
        BasketToken.Component[] memory c = new BasketToken.Component[](3);
        c[0] = BasketToken.Component(TSLA, TSLA_FEED, 0.4e18);
        c[1] = BasketToken.Component(NVDA, NVDA_FEED, 0.3e18);
        c[2] = BasketToken.Component(AAPL, AAPL_FEED, 0.3e18);
        basket = BasketToken(factory.createBasket("Tech Trio", "TRIO", c, MAX_PRICE_AGE));
    }

    function test_stockTokensExposeErc8056() public view {
        assertEq(IERC20Metadata(TSLA).decimals(), 18);
        assertGt(IScaledUIAmount(TSLA).uiMultiplier(), 0);
        assertGt(IScaledUIAmount(NVDA).uiMultiplier(), 0);
        assertGt(IScaledUIAmount(AAPL).uiMultiplier(), 0);
    }

    function test_feedsAreLiveUsdFeeds() public view {
        assertEq(AggregatorV3Interface(TSLA_FEED).decimals(), 8);
        (, int256 answer,, uint256 updatedAt,) = AggregatorV3Interface(TSLA_FEED).latestRoundData();
        assertGt(answer, 0);
        assertGt(updatedAt, 0);
    }

    function test_sharePriceUsd_againstRealFeeds() public view {
        uint256 price = basket.sharePriceUsd();
        // sanity band, three fractional shares of large caps should be worth 10 to 10000 usd
        assertGt(price, 10e8);
        assertLt(price, 10_000e8);
    }

    function test_mintAndRedeem_withRealStockTokens() public {
        deal(TSLA, alice, 1e18);
        deal(NVDA, alice, 1e18);
        deal(AAPL, alice, 1e18);

        vm.startPrank(alice);
        IERC20Metadata(TSLA).approve(address(basket), type(uint256).max);
        IERC20Metadata(NVDA).approve(address(basket), type(uint256).max);
        IERC20Metadata(AAPL).approve(address(basket), type(uint256).max);

        basket.mint(2e18, alice);
        assertEq(basket.balanceOf(alice), 2e18);
        assertEq(IERC20Metadata(TSLA).balanceOf(address(basket)), 0.8e18);

        basket.redeem(2e18, alice);
        assertEq(basket.totalSupply(), 0);
        assertEq(IERC20Metadata(TSLA).balanceOf(alice), 1e18);
        vm.stopPrank();
    }

    function test_balanceValueUsd_withRealFeeds() public {
        deal(TSLA, alice, 1e18);
        deal(NVDA, alice, 1e18);
        deal(AAPL, alice, 1e18);

        vm.startPrank(alice);
        IERC20Metadata(TSLA).approve(address(basket), type(uint256).max);
        IERC20Metadata(NVDA).approve(address(basket), type(uint256).max);
        IERC20Metadata(AAPL).approve(address(basket), type(uint256).max);
        basket.mint(1e18, alice);
        vm.stopPrank();

        assertEq(basket.balanceValueUsd(alice), basket.sharePriceUsd());
    }
}
