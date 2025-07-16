import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  // DI - app.serv dan instance aratmoqda
  constructor(private readonly appService: AppService) {}

  @Get() // Decorator - (Localhost 3000 dan u bu yerga keladi)
  getHello(): string {
    return this.appService.getHello();
  }
}