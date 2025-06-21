// like.module.ts
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
