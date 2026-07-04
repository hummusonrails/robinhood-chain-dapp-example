// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AggregatorV3Interface} from "../interfaces/AggregatorV3Interface.sol";

// chainlink compatible feed with a settable answer for tests and testnet demos
// real feeds exist on mainnet only, see docs.chain.link addresses page for robinhood
contract MockPriceFeed is AggregatorV3Interface {
    uint8 private immutable _decimals;
    string private _description;

    int256 private _answer;
    uint256 private _updatedAt;
    uint80 private _roundId;

    constructor(uint8 decimals_, string memory description_, int256 initialAnswer) {
        _decimals = decimals_;
        _description = description_;
        _setAnswer(initialAnswer);
    }

    function updateAnswer(int256 newAnswer) external {
        _setAnswer(newAnswer);
    }

    function decimals() external view returns (uint8) {
        return _decimals;
    }

    function description() external view returns (string memory) {
        return _description;
    }

    function version() external pure returns (uint256) {
        return 1;
    }

    function getRoundData(uint80)
        external
        view
        returns (uint80, int256, uint256, uint256, uint80)
    {
        return (_roundId, _answer, _updatedAt, _updatedAt, _roundId);
    }

    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80) {
        return (_roundId, _answer, _updatedAt, _updatedAt, _roundId);
    }

    function _setAnswer(int256 newAnswer) private {
        _roundId += 1;
        _answer = newAnswer;
        _updatedAt = block.timestamp;
    }
}
