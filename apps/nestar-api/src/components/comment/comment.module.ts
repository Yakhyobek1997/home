import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import CommentSchema from '../../schemas/Comment.model';

import { CommentsService } from './comment.service';
import { CommentsResolver } from './comment.resolver';

import { MemberModule } from '../member/member.module';
import { ViewModule } from '../view/view.module';
import { PropertyModule } from '../property/property.module';
import { BoardArticleModule } from '../board-article/board-article.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
    MemberModule,
    ViewModule,
    PropertyModule,
    BoardArticleModule,
    AuthModule
  ],
  providers: [CommentsService, CommentsResolver],
})
export class CommentModule {}

