const { ethers, run } = require("hardhat");
require("dotenv").config();

async function main() {
  const VaultTrader = await ethers.getContractFactory("VaultTrader");
  const vaultTrader = await VaultTrader.deploy(
    process.env.SWAPPER_ADDRESS,
    process.env.UNISWAP_V2_ROUTER_ADDRESS,
    process.env.UNISWAP_V3_ROUTER_ADDRESS,
    process.env.WETH_ADDRESS
  );

  const WAIT_BLOCK_CONFIRMATIONS = 6;
  await vaultTrader.deploymentTransaction().wait(WAIT_BLOCK_CONFIRMATIONS);

  console.log(`Token address ${vaultTrader.target}`);

  await run(`verify:verify`, {
    address: vaultTrader.target,
    constructorArguments: [
      process.env.SWAPPER_ADDRESS,
      process.env.UNISWAP_V2_ROUTER_ADDRESS,
      process.env.UNISWAP_V3_ROUTER_ADDRESS,
      process.env.WETH_ADDRESS,
    ],
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
