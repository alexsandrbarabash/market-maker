const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = require("ethers");

describe("VaultTrader", function () {
  let VaultTrader;
  let vaultTrader;
  let owner;
  let addr1;
  let addr2;
  let tokenA;
  let tokenB;
  let uniswapV2Router;
  let uniswapV3Router;
  let weth;

  beforeEach(async function () {
    VaultTrader = await ethers.getContractFactory("VaultTrader");
    [owner, addr1, addr2] = await ethers.getSigners();

    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    const WETHMock = await ethers.getContractFactory("WETHMock");
    tokenA = await ERC20Mock.deploy("Token A", "TKA", 18, parseEther("1000"));
    tokenB = await ERC20Mock.deploy("Token B", "TKB", 18, parseEther("1000"));
    weth = await WETHMock.deploy();

    const UniswapV2RouterMock = await ethers.getContractFactory(
      "UniswapV2RouterMock"
    );
    const UniswapV3RouterMock = await ethers.getContractFactory(
      "UniswapV3RouterMock"
    );

    uniswapV2Router = await UniswapV2RouterMock.deploy();
    uniswapV3Router = await UniswapV3RouterMock.deploy();

    vaultTrader = await VaultTrader.deploy(
      addr1.address,
      uniswapV2Router.target,
      uniswapV3Router.target,
      weth.target
    );
  });

  describe("swapV2ExactIn", () => {
    it("should successfully complete swapV2ExactIn", async () => {
      const amountIn = parseEther("10");
      const amountOutMin = parseEther("9");

      await tokenA.transfer(addr1.address, amountIn);
      await tokenA.connect(addr1).approve(vaultTrader.target, amountIn);

      await expect(
        vaultTrader
          .connect(addr1)
          .swapV2ExactIn(tokenA.target, tokenB.target, amountIn, amountOutMin)
      )
        .to.emit(uniswapV2Router, "Swap")
        .withArgs(tokenA.target, tokenB.target, amountIn, amountOutMin);
    });

    it("should throw not authorized error", async () => {
      const amountIn = parseEther("10");
      const amountOutMin = parseEther("9");

      await tokenA.transfer(addr2.address, amountIn);
      await tokenA.connect(addr2).approve(vaultTrader.target, amountIn);

      await expect(
        vaultTrader
          .connect(addr2)
          .swapV2ExactIn(tokenA.target, tokenB.target, amountIn, amountOutMin)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("swapV3ExactIn", () => {
    it("should successfully complete swapV3ExactIn", async () => {
      const amountIn = parseEther("10");
      const amountOutMin = parseEther("9");
      const fee = 3000;

      await tokenA.transfer(addr1.address, amountIn);
      await tokenA.connect(addr1).approve(vaultTrader.target, amountIn);

      await expect(
        vaultTrader
          .connect(addr1)
          .swapV3ExactIn(
            tokenA.target,
            tokenB.target,
            fee,
            amountIn,
            amountOutMin
          )
      )
        .to.emit(uniswapV3Router, "Swap")
        .withArgs(tokenA.target, tokenB.target, fee, amountIn, amountOutMin);
    });

    it("should throw not authorized error", async () => {
      const amountIn = parseEther("10");
      const amountOutMin = parseEther("9");
      const fee = 3000;

      await tokenA.transfer(addr2.address, amountIn);
      await tokenA.connect(addr2).approve(vaultTrader.target, amountIn);

      await expect(
        vaultTrader
          .connect(addr2)
          .swapV3ExactIn(
            tokenA.target,
            tokenB.target,
            fee,
            amountIn,
            amountOutMin
          )
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("withdrawTokensWithUnwrapIfNecessary", () => {
    it("should successfully complete withdrawTokensWithUnwrapIfNecessary with erc20 token", async () => {
      const amountIn = parseEther("10");

      await tokenA.transfer(vaultTrader.target, amountIn);

      await expect(
        vaultTrader
          .connect(owner)
          .withdrawTokensWithUnwrapIfNecessary(tokenA.target)
      )
        .to.emit(tokenA, "Transfer")
        .withArgs(vaultTrader.target, owner.address, amountIn);
    });

    it("should successfully complete withdrawTokensWithUnwrapIfNecessary with wrapped token", async () => {
      const amount = parseEther("50");

      await weth.deposit({ value: amount });
      await weth.transfer(vaultTrader.target, amount);

      await expect(
        vaultTrader
          .connect(owner)
          .withdrawTokensWithUnwrapIfNecessary(weth.target)
      ).to.changeEtherBalance(owner, amount);
    });

    it("should throw onlyOwner", async () => {
      const amount = parseEther("50");

      await weth.deposit({ value: amount });
      await weth.transfer(vaultTrader.target, amount);

      await expect(
        vaultTrader
          .connect(addr2)
          .withdrawTokensWithUnwrapIfNecessary(weth.target)
      ).to.be.reverted;
    });
  });
});
