import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BoardArticleService } from './board-article.service';
import { BoardArticle, BoardArticles } from '../../libs/board-article/board-article';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
	AllBoardArticlesInquiry,
	BoardArticleInput,
	BoardArticlesInquiry,
} from '../../libs/board-article/board-article.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { BoardArticleUpdate } from '../../libs/board-article/board-article.update';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver()
export class BoardArticleResolver {
	constructor(private readonly boardArticleService: BoardArticleService) {}

	@UseGuards(AuthGuard)
	@Mutation((returns) => BoardArticle)
	public async createBoardArticle(@Args('input') input: BoardArticleInput, @AuthMember('_id') memberId: ObjectId) {
		console.log('mutation: createBoardArticle');
		return await this.boardArticleService.createBoardArticle(memberId, input);
	}
	@UseGuards(WithoutGuard)
	@Query((returns) => BoardArticle)
	public async getBoardArticle(@Args('articleId') input: string, @AuthMember('_id') memberId: ObjectId) {
		console.log('query: getBoardArticle');
		const articleId = shapeIntoMongoObjectId(input);
		return await this.boardArticleService.getBoardArticle(memberId, articleId);
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => BoardArticle)
	public async updateBoardArticle(@Args('input') input: BoardArticleUpdate, @AuthMember('_id') memberId: ObjectId) {
		console.log('mutation: updateBoardArticle');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.boardArticleService.updateBoardArticle(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => BoardArticles)
	public async getBoardArticles(@Args('input') input: BoardArticlesInquiry, @AuthMember('_id') memberId: ObjectId) {
		console.log('query: getBoardArticles');
		return await this.boardArticleService.getBoardArticles(memberId, input);
	}

	// ** Admin **

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => BoardArticles)
	public async getAllBoardArticlesByAdmin(
		@Args('input') input: AllBoardArticlesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	) {
		console.log('query: getAllBoardArticlesByAdmin');
		return await this.boardArticleService.getAllBoardArticlesByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => BoardArticle)
	public async updateBoardArticleByAdmin(
		@Args('input') input: BoardArticleUpdate,
		@AuthMember('_id') memberId: ObjectId,
	) {
		console.log('mutation: updateBoardArticleByAdmin');
		input._id = shapeIntoMongoObjectId(input._id); 
		return await this.boardArticleService.updateBoardArticleByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => BoardArticle)
	public async removeBoardArticleByAdmin(@Args('articleId') input: string, @AuthMember('_id') memberId: ObjectId) {
		console.log('mutation: createBoardArticle');
		const articleId = shapeIntoMongoObjectId(input);
		return await this.boardArticleService.removeBoardArticleByAdmin(articleId);
	}
}
