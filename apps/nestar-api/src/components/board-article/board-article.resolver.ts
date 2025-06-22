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

// Auth bolgan userla uchun
	@UseGuards(AuthGuard) 
	@Mutation((returns) => BoardArticle)
	// createBoardArticle Mutation grapql bor u ikta paramaetr olmoqda
	// input va memberId
	public async createBoardArticle(@Args('input') input: BoardArticleInput, @AuthMember('_id') memberId: ObjectId,)
	: Promise<BoardArticle> { // promise da BoardArticleni qaytarmoqda
		console.log('mutation: createBoardArticle');
		// keyn boardArticleService objectni createBoardArticle methodiga
		// memberId, input argument sifatida berib kutib return qivommiz.
		return await this.boardArticleService.createBoardArticle(memberId, input);
	}

// RETRIVER - login bo'lmasaham ko'rsa bo'ladi

	@UseGuards(WithoutGuard)
	@Query((returns) => BoardArticle)
	public async getBoardArticle(@Args('articleId') input: string, @AuthMember('_id') memberId: ObjectId) {
	// getBoardArticle Grapql Api input a memberid ni parametr sifatida olib
		console.log('query: getBoardArticle');
	// inputni shape qilib articleId constantaga tenglashtrdik
		const articleId = shapeIntoMongoObjectId(input);
		return await this.boardArticleService.getBoardArticle(memberId, articleId);
	// boardArticleService objectni getBoardArticle methodiga ikta argument berdik,
	//  berib kutib return qivommiz
	}


	@UseGuards(AuthGuard)
	@Mutation((returns) => BoardArticle)
	public async updateBoardArticle(@Args('input') input: BoardArticleUpdate, @AuthMember('_id') memberId: ObjectId) {
		console.log('mutation: updateBoardArticle');
		input._id = shapeIntoMongoObjectId(input._id);
	// input._id shape  qlib 
		return await this.boardArticleService.updateBoardArticle(memberId, input);
		// boardArticleService objectga .updateBoardArticle methodni berib ichida ikta argument bedik
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => BoardArticles)
	public async getBoardArticles(@Args('input') input: BoardArticlesInquiry, @AuthMember('_id') memberId: ObjectId) {
		console.log('query: getBoardArticles');
		return await this.boardArticleService.getBoardArticles(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => BoardArticle)
	public async likeTargetBoardArticle(
		@Args('articleId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticle> {
		console.log('Mutation: LikeTargetBoardArticle');
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.boardArticleService.likeTargetBoardArticle(memberId, likeRefId);
	}

	// ** Admin **

// AUTHORITHA

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
