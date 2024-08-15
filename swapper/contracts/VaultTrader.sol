// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/** Get from https://docs.uniswap.org/contracts/v3/reference/deployments/ethereum-deployments */
interface IWETH is IERC20 {
    function deposit() external payable;

    function withdraw(uint256) external;
}

contract VaultTrader is Ownable {
    using SafeERC20 for IERC20;

    IUniswapV2Router02 public uniswapV2Router;
    ISwapRouter public uniswapV3Router;
    address public WETH;
    address public swapper;

    constructor(
        address _swapper,
        address _uniswapV2Router,
        address _uniswapV3Router,
        address _WETH
    ) Ownable(msg.sender) {
        uniswapV2Router = IUniswapV2Router02(_uniswapV2Router);
        uniswapV3Router = ISwapRouter(_uniswapV3Router);
        WETH = _WETH;
        swapper = _swapper;
    }

    modifier onlySwapper() {
        require(msg.sender == swapper, "Not authorized");
        _;
    }

    function swapV2ExactIn(
        address tokenIn,
        address tokenOut,
        uint amountIn,
        uint amountOutMin
    ) external onlySwapper {
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenIn).approve(address(uniswapV2Router), amountIn);

        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        uniswapV2Router.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
    }

    function swapV3ExactIn(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint amountIn,
        uint amountOutMin
    ) external onlySwapper {
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenIn).approve(address(uniswapV3Router), amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: fee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: amountOutMin,
                sqrtPriceLimitX96: 0
            });

        uniswapV3Router.exactInputSingle(params);
    }

    function withdrawTokensWithUnwrapIfNecessary(
        address tokenAddress
    ) external onlyOwner {
        uint256 balance = IERC20(tokenAddress).balanceOf(address(this));
        if (tokenAddress == WETH) {
            IWETH(WETH).withdraw(balance);
            payable(msg.sender).transfer(balance);
        } else {
            IERC20(tokenAddress).safeTransfer(msg.sender, balance);
        }
    }

    receive() external payable {}
}
