import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  // DI - app.serv dan instance aratmoqda
  constructor(private readonly appService: AppService) {}

  @Get() // Decorator
  getHello(): string {
    return this.appService.getHello();
  }
}