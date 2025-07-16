import { Controller, Get, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Cron, Interval, Timeout } from '@nestjs/schedule';

// CRON -belgilangan vaqtda avtomatik bajariladigan vazifala

@Controller() 
// Bu yerda @Controller dekoratori orqali BatchControlle
export class BatchController {
  // BatchControlle
// nomli klass yaratilgan bo‘lib, bu klass batch (ya'ni fon rejimidagi) ishlar uchun mo‘ljallangan.
  private logger: Logger = new Logger('BatchController');
// Klass ichida Logger tipidagi logger degan property bor,
// u log yozish uchun ishlatiladi  context nomi sifatida 'BatchController' berdik
  constructor(private readonly batchService: BatchService) {}
 // Konstruktor orqali batchService degan servis DI 
 // (ya’ni dependency injection) orqali olinib, readonly property sifatida saqlangan 

  @Timeout(1000) //  @Timeout(1000) dekoratori bilan belgilangan.
  handleTimeout() { // birinchi method handleTimeout deb nomlangan
    this.logger.debug('BATCH SERVER READY!');
    // Bu method app ishga tushgandan 1 soniyadan so‘ng avtomatik chaqiriladi
  }

 @Cron('00 00 * * * *', { name: 'BATCH_ROLLBACK' })
public async batchRollback() { 
  // Keyingi method esa batchRollback asyn hron
  //  u @Cron dekoratori orqali har soat boshida avtomatik ishga tushadi. 
  try { // va try va catch blok bor
    this.logger['context'] = 'BATCH_ROLLBACK';
    // qatori orqali loggerga kontekst dinamik tarzda berilmoqda, 
    this.logger.debug('EXECUTED!');
    // Keyin debug('EXECUTED!') logi chiqadi
    await this.batchService.batchRollback();
    // batchService obyektining batchRollback nomli methodi await bilan chaqiriladi
  } catch (err) {
    this.logger.error(err);
  }
}

@Cron('20 00 * * * *', { name: 'BATCH_TOP_PROPERTIES' })
public async batchTopProperties() {
  try {
    this.logger['context'] = 'BATCH_TOP_PROPERTIES';
    this.logger.debug('EXECUTED!');
    await this.batchService.batchTopProperties();
  } catch (err) {
    this.logger.error(err);
  }
}

@Cron('40 00 * * * *', { name: 'BATCH_TOP_AGENTS' })
public async batchTopAgents() {
  try {
    this.logger['context'] = 'BATCH_TOP_AGENTS';
    this.logger.debug('EXECUTED!');
    await this.batchService.batchTopAgents();
  } catch (err) {
    this.logger.error(err);
  }
}


  /*
  @Interval(1000)
  handleInterval() {
    this.logger.debug('INTERVAL TEST');
  }
  */

  // @Get()
  // getHello(): string {
  //   return this.batchService.getHello();
  // }
}
