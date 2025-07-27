import { Controller, Get, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import {
  BATCH_ROLLBACK,
  BATCH_TOP_AGENTS,
  BATCH_TOP_PROPERTIES,
} from './libs/config';

@Controller()
export class BatchController {
  private logger: Logger = new Logger('SocketEventsLogger');
  constructor(private readonly batchService: BatchService) {}

  //timeout. in the first second
  @Timeout(1000)
  handleTimeOut() {
    this.logger.debug('timeOUT');
  }

  @Cron('00 00 01 * * *', { name: BATCH_ROLLBACK })
  public async batchRollback() {
    try {
      this.logger['context'] = BATCH_ROLLBACK;
      this.logger.debug('Executed');
      await this.batchService.batchRollback();
    } catch (error) {
      this.logger.error('error', error);
    }
  }

  @Cron('20 00 01 * * *', { name: BATCH_TOP_AGENTS })
  public async batchTopAgents() {
    try {
      this.logger['context'] = BATCH_TOP_AGENTS;
      this.logger.debug('Executed');
      await this.batchService.batchTopAgents();
    } catch (error) {
      this.logger.error('error', error);
    }
  }

  @Cron('40 00 01 * * *', { name: BATCH_TOP_PROPERTIES })
  public async batchTopProperties() {
    try {
      this.logger['context'] = BATCH_TOP_PROPERTIES;
      this.logger.debug('Executed');
      await this.batchService.batchTopProperties();
    } catch (error) {
      this.logger.error('error', error);
    }
  }

  @Get()
  getHello(): string {
    return this.batchService.getHello();
  }

  //every one second
  // @Interval(1000)
  // handleInterval() {
  //   this.logger.debug('Interval');
  // }
}
