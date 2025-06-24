import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import LikeSchema from '../../schemas/Like.model';
import { LikeService } from './like.service';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'like', schema: LikeSchema }])
  ],
  providers: [LikeService],
  exports: [LikeService],
})
export class LikeModule {}


// LikeModule — like qilishga oid barcha ishlarni 
// (masalan: yoqtirish, yoqtirilganini tekshirish, bekor qilish) bir joyda jamlaydi.
// U LikeServiceni ishlatadi va uni boshqa modullarga ham taqdim etadi.
// MongoDB bilan ishlash uchun esa like nomli modelni LikeSchema asosida ro‘yxatga olgan.