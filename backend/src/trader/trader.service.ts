import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import abi from '../abi/VaultTrader.json';

@Injectable()
export class TraderService {
  constructor(private readonly configService: ConfigService) {}

  public async trade(): Promise<void> {
    const rpcUrl = this.configService.get('RPC_URL');
    const privateKey = this.configService.get('PRIVATE_KEY');
    const contractAddress = this.configService.get('CONTRACT_ADDRESS');
    const buyAmount = this.configService.get('BUY_AMOUNT');
    const sellAmount = this.configService.get('SELL_AMOUNT');
    const tokenIn = this.configService.get('TOKEN_IN');
    const tokenOut = this.configService.get('TOKEN_OUT');

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    await this.buyTokens(contract, buyAmount, tokenIn, tokenOut);
    await this.sellTokens(contract, sellAmount, tokenIn, tokenOut);
  }

  public async buyTokens(
    contract: ethers.Contract,
    buyAmount: bigint,
    tokenIn: string,
    tokenOut: string,
  ) {
    const tx = await contract.swapV2ExactIn(
      tokenIn,
      tokenOut,
      buyAmount,
      ethers.parseEther('0'),
    );
    await tx.wait();
  }

  public async sellTokens(
    contract: ethers.Contract,
    sellAmount: bigint,
    tokenIn: string,
    tokenOut: string,
  ) {
    const tx = await contract.swapV2ExactIn(
      tokenOut,
      tokenIn,
      sellAmount,
      ethers.parseEther(tokenIn),
    );
    await tx.wait();
  }
}
