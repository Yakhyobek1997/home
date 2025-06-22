import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';
import { Model, ObjectId } from 'mongoose';
import { BoardArticle, BoardArticles } from '../../libs/board-article/board-article';
import {
	AllBoardArticlesInquiry,
	BoardArticleInput,
	BoardArticlesInquiry,
} from '../../libs/board-article/board-article.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { BoardArticleStatus } from '../../libs/enums/board-article.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewGroup } from '../../libs/enums/view.enum';
import { BoardArticleUpdate } from '../../libs/board-article/board-article.update';
import { lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';

@Injectable()
export class BoardArticleService {
	constructor(
		@InjectModel('BoardArticle')
		private readonly boardArticleModel: Model<BoardArticle>,
		private memberService: MemberService,
		private viewService: ViewService,
		private likeService: LikeService,
	) {}
	// CreateBoardArticle
	public async createBoardArticle(memberId: ObjectId, input: BoardArticleInput): Promise<BoardArticle> {
	// CreateBoardArticle method bor public async method memberId va inputni parametr siftida berib 
	// Pomise da BoardArticleni qaytarmoqda.
		input.memberId = memberId;
		// parametrda berilgan memberIdni input ichida berilgan meberId ga tenglashtirvommiz
		try { // 2 block try va catch blogidan foydalanvommiz
			const result = await this.boardArticleModel.create(input);
        // boardArticle schema Modelni create static methodga inputni argument berib
		// kutib resultga tengladiik
			await this.memberService.memberStatsEditor({
		// memberService object .memberStatsEditor static methodga
		// bitta argument berib key value larini bervommiz
				_id: memberId,
				targetKey: 'memberArticles',
				modifier: 1,
			});
			result.memberData = await this.memberService.getMember(
				null, //
				result.memberId, //
			);
			return result;
		} catch (error) {
			console.log('createBoardArticle error', error);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}
	// GetBoardArticle
	public async getBoardArticle(memberId: ObjectId, articleId: ObjectId): Promise<BoardArticle> {
	// getBoardArticle public async method va ikta memberId va articleIdni parametrni
	// berib Promise qilib BoardArticleni qaytravommiz
		const search: T = { // T turli search constantani create qilib 
			_id: articleId,
			articleStatus: BoardArticleStatus.ACTIVE,
			// BoardArticleStatus objectni
		};
		const result = await this.boardArticleModel.findOne(search).exec();
	// boardArticleModel schema modelni findOne static methodni chaqrib
	// searchni argumetn sifatida bervommiz excuetion qilib await qilib result ga tengladik

	// agar yuqordergla bo'masa error handling bo'ladi 
		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) { // Agar memberId mavjud bo‘lsa
	const viewInput = { // viewInput obyekt yaratilmoqda
		memberId: memberId,
		viewRefId: articleId,
		viewGroup: ViewGroup.ARTICLE,
	};
	const newView = await this.viewService.recordView(viewInput);
	// viewService objectni recordView methodga viewInput argu berib
	// await qilib newView xosil qivommiz
	if (newView) { // Keyin newView bo'lsa 
		await this.boardArticleStatsEditor({
	// boardArticleStatsEditor ga pastegilarni object sifatida berdik 
			_id: articleId,
			targetKey: 'articleViews',
			modifier: 1,
		});
		result.articleViews++; // 1 tadan View qo'shvommiz
	}

	//  likeInput object  u yerda 3 ta property dan berdik
	const likeInput = {
		memberId: memberId, // laykni bosgan foydalanuvchining IDsi.
		likeRefId: articleId,// Layk bosilgan obyektning IDsi
		likeGroup: LikeGroup.ARTICLE };// Layk qaysi **kategoriya (tur)**ga tegishli
	result.meLiked = await this.likeService.checkLikeExistence(likeInput);
	// likeService objectni checkLikeExistence methodga likeInput argument qilib kutib resultni meLikedga tenglashtirdik 
}
 
		result.memberData = await this.memberService.getMember(null, result.memberId); // null - article view oshirihs uchun qildik
		// memberService objectni getMember methodni call qilib memberId argument sifatida berib ktuib 
		return result; // result ga tenglashtrdik
	}
	// UpdateBoardArticle
	public async updateBoardArticle(memberId: ObjectId, input: BoardArticleUpdate): Promise<BoardArticle> {
		const { _id, articleStatus } = input;
		const search: T = {
			_id: _id,
			memberId: memberId,
			articleStatus: BoardArticleStatus.ACTIVE,
		};
		const result = await this.boardArticleModel
			.findOneAndUpdate(search, input, {
				new: true,
			})
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (articleStatus === BoardArticleStatus.DELETE) {
			await this.memberService.memberStatsEditor({
				_id: memberId,
				targetKey: 'memberArticles',
				modifier: -1,
			});
		}
		return result;
	}

	// GetBoardArticles
	public async getBoardArticles(memberId: ObjectId, input: BoardArticlesInquiry): Promise<BoardArticles> {
		const { articleCategory, text } = input.search;
		const match: T = { articleStatus: BoardArticleStatus.ACTIVE };
		const sort = {
			[input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
		};

		if (articleCategory) match.articleCategory = articleCategory;
		if (text) match.articleTitle = { $regex: new RegExp(text, 'i') };
		if (input.search?.memberId) {
			match.memberId = shapeIntoMongoObjectId(input.search.memberId);
		}
		console.log('match', match);

		const result = await this.boardArticleModel
			.aggregate([
				{ $match: match },
				{
					$sort: sort,
				},
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							//liked
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async likeTargetBoardArticle(memberId: ObjectId, likeRefId: ObjectId): Promise<BoardArticle> {
		const target: BoardArticle | null = await this.boardArticleModel
			.findOne({ _id: likeRefId, articleStatus: BoardArticleStatus.ACTIVE })
			.exec();

		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.ARTICLE,
		};

		const modifier: number = await this.likeService.toggleLike(input);

		const result = await this.boardArticleStatsEditor({
			_id: likeRefId,
			targetKey: 'articleLikes',
			modifier: modifier,
		});

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		return result;
	}

	// Admin
	public async getAllBoardArticlesByAdmin(input: AllBoardArticlesInquiry): Promise<BoardArticles> {
		const { articleCategory, articleStatus } = input.search;
		const match: T = {};
		const sort = {
			[input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
		};
		if (articleCategory) match.articleCategory = articleCategory;
		if (articleStatus) match.articleStatus = articleStatus;
		console.log('match', match);

		const result = await this.boardArticleModel
			.aggregate([
				{ $match: match },
				{
					$sort: sort,
				},
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async updateBoardArticleByAdmin(input: BoardArticleUpdate) {
		const { _id, articleStatus } = input;
		const result = await this.boardArticleModel
			.findOneAndUpdate(
				{
					_id: _id,
					articleStatus: BoardArticleStatus.ACTIVE,
				},
				input,
				{
					new: true,
				},
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (articleStatus === BoardArticleStatus.DELETE) {
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberArticles',
				modifier: -1,
			});
		}
		return result;
	}

	public async removeBoardArticleByAdmin(articleId: ObjectId): Promise<BoardArticle> {
		const search: T = {
			_id: articleId,
			articleStatus: BoardArticleStatus.DELETE,
		};

		const result = await this.boardArticleModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}

	public async boardArticleStatsEditor(input: StatisticModifier): Promise<BoardArticle | null> {
		const { _id, targetKey, modifier } = input;
		return await this.boardArticleModel
			.findOneAndUpdate(
				_id,
				{
					$inc: { [targetKey]: modifier },
				},
				{ new: true },
			)
			.exec();
	}
}
