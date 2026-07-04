// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {BasketFactory} from "../src/BasketFactory.sol";
import {BasketToken} from "../src/BasketToken.sol";
import {MockStockToken} from "../src/mocks/MockStockToken.sol";
import {MockPriceFeed} from "../src/mocks/MockPriceFeed.sol";

// deploys the basket factory and a demo basket per network
//
// robinhood chain mainnet (4663)
//   real stock tokens from https://docs.robinhood.com/chain/contracts/
//   real chainlink feeds from https://docs.chain.link/data-feeds/price-feeds/addresses?network=robinhood
//
// robinhood chain testnet (46630)
//   real faucet stock tokens, chainlink feeds do not exist on testnet so mock feeds are deployed
//
// anvil (31337)
//   mock stock tokens and mock feeds, demo supply minted to the deployer
contract Deploy is Script {
    // mainnet stock tokens
    address internal constant MAINNET_TSLA = 0x322F0929c4625eD5bAd873c95208D54E1c003b2d;
    address internal constant MAINNET_NVDA = 0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC;
    address internal constant MAINNET_AAPL = 0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9;

    // mainnet chainlink feeds
    address internal constant MAINNET_TSLA_FEED = 0x4A1166a659A55625345e9515b32adECea5547C38;
    address internal constant MAINNET_NVDA_FEED = 0x379EC4f7C378F34a1B47E4F3cbeBCbAC3E8E9F15;
    address internal constant MAINNET_AAPL_FEED = 0x6B22A786bAa607d76728168703a39Ea9C99f2cD0;

    // testnet faucet stock tokens, dispensed by https://faucet.testnet.chain.robinhood.com
    address internal constant TESTNET_TSLA = 0xC9f9c86933092BbbfFF3CCb4b105A4A94bf3Bd4E;
    address internal constant TESTNET_AMZN = 0x5884aD2f920c162CFBbACc88C9C51AA75eC09E02;
    address internal constant TESTNET_NFLX = 0x3b8262A63d25f0477c4DDE23F83cfe22Cb768C93;

    // stock feeds update 24/5 so allow a long weekend before pricing reverts as stale
    uint256 internal constant MAX_PRICE_AGE = 4 days;

    function run() external {
        vm.startBroadcast();

        BasketFactory factory = new BasketFactory();
        console2.log("FACTORY=%s", address(factory));

        BasketToken.Component[] memory components;
        if (block.chainid == 4663) {
            components = _mainnetComponents();
        } else if (block.chainid == 46630) {
            components = _testnetComponents();
        } else {
            components = _localComponents();
        }

        address basket = factory.createBasket("Tech Trio", "TRIO", components, MAX_PRICE_AGE);
        console2.log("DEMO_BASKET=%s", basket);
        console2.log("CHAIN_ID=%s", block.chainid);

        vm.stopBroadcast();
    }

    function _mainnetComponents() internal pure returns (BasketToken.Component[] memory c) {
        c = new BasketToken.Component[](3);
        c[0] = BasketToken.Component(MAINNET_TSLA, MAINNET_TSLA_FEED, 0.4e18);
        c[1] = BasketToken.Component(MAINNET_NVDA, MAINNET_NVDA_FEED, 0.3e18);
        c[2] = BasketToken.Component(MAINNET_AAPL, MAINNET_AAPL_FEED, 0.3e18);
    }

    function _testnetComponents() internal returns (BasketToken.Component[] memory c) {
        // demo prices, real chainlink feeds exist on mainnet only
        MockPriceFeed tslaFeed = new MockPriceFeed(8, "RHTSLA / USD", 400e8);
        MockPriceFeed amznFeed = new MockPriceFeed(8, "RHAMZN / USD", 230e8);
        MockPriceFeed nflxFeed = new MockPriceFeed(8, "RHNFLX / USD", 120e8);
        console2.log("TSLA_FEED=%s", address(tslaFeed));
        console2.log("AMZN_FEED=%s", address(amznFeed));
        console2.log("NFLX_FEED=%s", address(nflxFeed));

        c = new BasketToken.Component[](3);
        c[0] = BasketToken.Component(TESTNET_TSLA, address(tslaFeed), 0.4e18);
        c[1] = BasketToken.Component(TESTNET_AMZN, address(amznFeed), 0.3e18);
        c[2] = BasketToken.Component(TESTNET_NFLX, address(nflxFeed), 0.3e18);
    }

    function _localComponents() internal returns (BasketToken.Component[] memory c) {
        MockStockToken tsla = new MockStockToken("Tesla", "TSLA");
        MockStockToken amzn = new MockStockToken("Amazon", "AMZN");
        MockStockToken nflx = new MockStockToken("Netflix", "NFLX");
        console2.log("TSLA=%s", address(tsla));
        console2.log("AMZN=%s", address(amzn));
        console2.log("NFLX=%s", address(nflx));

        tsla.mint(msg.sender, 1_000e18);
        amzn.mint(msg.sender, 1_000e18);
        nflx.mint(msg.sender, 1_000e18);

        MockPriceFeed tslaFeed = new MockPriceFeed(8, "RHTSLA / USD", 400e8);
        MockPriceFeed amznFeed = new MockPriceFeed(8, "RHAMZN / USD", 230e8);
        MockPriceFeed nflxFeed = new MockPriceFeed(8, "RHNFLX / USD", 120e8);
        console2.log("TSLA_FEED=%s", address(tslaFeed));
        console2.log("AMZN_FEED=%s", address(amznFeed));
        console2.log("NFLX_FEED=%s", address(nflxFeed));

        c = new BasketToken.Component[](3);
        c[0] = BasketToken.Component(address(tsla), address(tslaFeed), 0.4e18);
        c[1] = BasketToken.Component(address(amzn), address(amznFeed), 0.3e18);
        c[2] = BasketToken.Component(address(nflx), address(nflxFeed), 0.3e18);
    }
}
