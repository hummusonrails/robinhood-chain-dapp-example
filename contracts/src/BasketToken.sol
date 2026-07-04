// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {
    IERC20,
    IERC20Metadata
} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {AggregatorV3Interface} from "./interfaces/AggregatorV3Interface.sol";

// erc-20 index basket backed 1:1 by robinhood chain stock tokens
// one share (1e18) is always redeemable for a fixed amount of each component
// fully collateralized, no owner, no fees, no rebalancing
contract BasketToken is ERC20, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Component {
        address token;
        address feed;
        // raw token amount backing one basket share
        uint256 unitsPerShare;
    }

    uint256 public constant SHARE_UNIT = 1e18;

    // chainlink usd feeds answer with 8 decimals on robinhood chain
    uint8 public constant USD_DECIMALS = 8;

    // stock feeds update 24/5 so quotes go quiet over weekends
    uint256 public immutable maxPriceAge;

    address public immutable factory;

    Component[] private _components;

    mapping(address token => uint8) private _tokenDecimals;

    event Minted(address indexed sender, address indexed to, uint256 shares);
    event Redeemed(address indexed sender, address indexed to, uint256 shares);

    error EmptyComponents();
    error TooManyComponents(uint256 count);
    error ZeroAddress();
    error ZeroUnits(address token);
    error DuplicateToken(address token);
    error UnexpectedFeedDecimals(address feed, uint8 decimals);
    error ZeroShares();
    error StalePrice(address feed, uint256 updatedAt);
    error InvalidPrice(address feed, int256 answer);

    constructor(
        string memory name_,
        string memory symbol_,
        Component[] memory components_,
        uint256 maxPriceAge_
    ) ERC20(name_, symbol_) {
        uint256 count = components_.length;
        if (count == 0) revert EmptyComponents();
        if (count > 10) revert TooManyComponents(count);

        for (uint256 i = 0; i < count; i++) {
            Component memory c = components_[i];
            if (c.token == address(0) || c.feed == address(0)) revert ZeroAddress();
            if (c.unitsPerShare == 0) revert ZeroUnits(c.token);
            if (_tokenDecimals[c.token] != 0) revert DuplicateToken(c.token);

            uint8 feedDecimals = AggregatorV3Interface(c.feed).decimals();
            if (feedDecimals != USD_DECIMALS) {
                revert UnexpectedFeedDecimals(c.feed, feedDecimals);
            }

            _tokenDecimals[c.token] = IERC20Metadata(c.token).decimals();
            _components.push(c);
        }

        maxPriceAge = maxPriceAge_;
        factory = msg.sender;
    }

    // deposit the components and mint shares, amounts round up so minters never underpay
    function mint(uint256 shares, address to) external nonReentrant {
        if (shares == 0) revert ZeroShares();

        uint256 count = _components.length;
        for (uint256 i = 0; i < count; i++) {
            Component memory c = _components[i];
            uint256 amount = Math.mulDiv(c.unitsPerShare, shares, SHARE_UNIT, Math.Rounding.Ceil);
            IERC20(c.token).safeTransferFrom(msg.sender, address(this), amount);
        }

        _mint(to, shares);
        emit Minted(msg.sender, to, shares);
    }

    // burn shares and withdraw the components, amounts round down so reserves never overdraw
    function redeem(uint256 shares, address to) external nonReentrant {
        if (shares == 0) revert ZeroShares();
        if (to == address(0)) revert ZeroAddress();

        _burn(msg.sender, shares);

        uint256 count = _components.length;
        for (uint256 i = 0; i < count; i++) {
            Component memory c = _components[i];
            uint256 amount = Math.mulDiv(c.unitsPerShare, shares, SHARE_UNIT, Math.Rounding.Floor);
            IERC20(c.token).safeTransfer(to, amount);
        }

        emit Redeemed(msg.sender, to, shares);
    }

    function quoteMint(uint256 shares) external view returns (uint256[] memory amounts) {
        uint256 count = _components.length;
        amounts = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            amounts[i] =
                Math.mulDiv(_components[i].unitsPerShare, shares, SHARE_UNIT, Math.Rounding.Ceil);
        }
    }

    function quoteRedeem(uint256 shares) external view returns (uint256[] memory amounts) {
        uint256 count = _components.length;
        amounts = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            amounts[i] =
                Math.mulDiv(_components[i].unitsPerShare, shares, SHARE_UNIT, Math.Rounding.Floor);
        }
    }

    // usd value of one share with 8 decimals
    // feeds price the raw stock token with corporate actions applied so no uiMultiplier here
    function sharePriceUsd() public view returns (uint256 price) {
        uint256 count = _components.length;
        for (uint256 i = 0; i < count; i++) {
            Component memory c = _components[i];
            uint256 tokenPrice = _readPrice(c.feed);
            price += Math.mulDiv(tokenPrice, c.unitsPerShare, 10 ** _tokenDecimals[c.token]);
        }
    }

    function balanceValueUsd(address account) external view returns (uint256) {
        return Math.mulDiv(sharePriceUsd(), balanceOf(account), SHARE_UNIT);
    }

    function totalValueUsd() external view returns (uint256) {
        return Math.mulDiv(sharePriceUsd(), totalSupply(), SHARE_UNIT);
    }

    function componentCount() external view returns (uint256) {
        return _components.length;
    }

    function componentAt(uint256 index) external view returns (Component memory) {
        return _components[index];
    }

    function components() external view returns (Component[] memory) {
        return _components;
    }

    function _readPrice(address feed) private view returns (uint256) {
        (, int256 answer,, uint256 updatedAt,) = AggregatorV3Interface(feed).latestRoundData();
        if (answer <= 0) revert InvalidPrice(feed, answer);
        if (block.timestamp > updatedAt + maxPriceAge) revert StalePrice(feed, updatedAt);
        return uint256(answer);
    }
}
