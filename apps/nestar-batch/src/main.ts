import { NestFactory } from '@nestjs/core';
import { BatchModule } from './batch.module';

async function bootstrap() {
  const app = await NestFactory.create(BatchModule);
  await app.listen(process.env.PORT_BATCH ?? 3000);
}
bootstrap();


//* bootstrap() bu app ishga tushuruvchi asinxron funksiya bo‘lib,
// unda NestFactory.create(...) orqali BatchModule nomli
// modul asosida yangi NestJS ilovasi yaratiladi.
// Hosil bo‘lgan app obyekt listen() metodi orqali
// HTTP portda ishga tushiriladi. Port nomi process.env.PORT_BATCH
// orqali tashqi muhitdan olinadi, agar u bo‘sh bo‘lsa,
// default holatda 3000 portda ishlaydi. Funksiya oxirida bootstrap() chaqiriladi/