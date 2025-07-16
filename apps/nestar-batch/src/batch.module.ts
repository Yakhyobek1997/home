import { Module } from '@nestjs/common';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../src/database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import PropertySchema  from '../../nestar-api/src/schemas/Property.model';
import MemberSchema from 'apps/nestar-api/src/schemas/Member.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(),// bu ConfigModuledan forRoot() nomli static method chaqirilib
     // butun dasturga konfiguratsiyalarni o‘qish imkoniyati berilgan.
    DatabaseModule,
    ScheduleModule.forRoot(),// bu esa NestJS`ning cron va vaqt bo‘yicha
    // ishlaydigan vazifalar uchun kerak bo‘ladigan modulidir.
    MongooseModule.forFeature([{ name: 'Property', schema: PropertySchema }]),
    MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
    // bu ikki marta chaqirilgan: birinchisida Property 
    // nomli model uchun PropertySchema uzatilgan,
    // ikkinchisida esa Member modeli uchun MemberSchema. 
    // Bu har biri object bo‘lib, ular orqali MongoDB kolleksiyalar bilan ishlash mumkin bo‘ladi.
  ],
  controllers: [BatchController],
  // controllers bo‘limida faqat BatchController bor 
  // bu modulning asosiy HTTP yoki cron vazifalarni bajarayotgan controller componentidir.
  providers: [BatchService],
  //  bu service NestJSda ishni bajaruvchi
  // (biznes logikani yurituvchi) qism bo‘lib
  //  bu controller ichida chaqiriladi va dependency injection orqali ishlaydi.
})
export class BatchModule {}
