import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TraderService } from './trader.service';

@Injectable()
export class TraderCron {
  constructor(private readonly traderService: TraderService) {}

  @Cron(CronExpression.EVERY_SECOND)
  async trade(): Promise<void> {
    await this.traderService.trade();
  }
}
