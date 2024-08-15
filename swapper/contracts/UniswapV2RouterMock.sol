// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract UniswapV2RouterMock {
    event Swap(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    );

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {
        emit Swap(path[0], path[path.length - 1], amountIn, amountOutMin);
        amounts = new uint[](path.length);
        amounts[amounts.length - 1] = amountOutMin;
    }
}
