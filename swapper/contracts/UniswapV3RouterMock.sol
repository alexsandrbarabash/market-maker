// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract UniswapV3RouterMock {
    event Swap(
        address indexed tokenIn,
        address indexed tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint256 amountOutMin
    );

    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(
        ExactInputSingleParams calldata params
    ) external returns (uint256 amountOut) {
        emit Swap(
            params.tokenIn,
            params.tokenOut,
            params.fee,
            params.amountIn,
            params.amountOutMinimum
        );
        amountOut = params.amountOutMinimum;
    }
}
