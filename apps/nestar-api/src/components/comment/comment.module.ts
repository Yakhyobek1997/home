import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import CommentSchema from '../../schemas/Comment.model';
import { CommentService } from './comment.service';
import { CommentResolver } from './comment.resolver';
import { MemberModule } from '../member/member.module';
import { ViewModule } from '../view/view.module';
import { PropertyModule } from '../property/property.module';
import { BoardArticleModule } from '../board-article/board-article.module';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
		AuthModule,
    MemberModule,
    PropertyModule,
    BoardArticleModule, 
    ViewModule
	],
	providers: [CommentResolver, CommentService],
})
export class CommentModule {}
