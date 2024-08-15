import { Module } from '@nestjs/common';
import { TraderCron } from './trader.cron';
import { TraderService } from './trader.service';

@Module({ providers: [TraderCron, TraderService] })
export class TraderModule {}
