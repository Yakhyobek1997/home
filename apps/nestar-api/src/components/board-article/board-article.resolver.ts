import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BoardArticleService } from './board-article.service';
import {
  BoardArticle,
  BoardArticles,
} from '../../libs/dto/board-article/board-article';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  AllBoardArticlesInquiry,
  BoardArticleInput,
  BoardArticlesInquiry,
} from '../../libs/dto/board-article/board-article.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeId } from '../../libs/config';
import { BoardArticleUpdate } from '../../libs/dto/board-article/board-article.update';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver()
export class BoardArticleResolver {
  constructor(private readonly boardArticleService: BoardArticleService) {}

  //createBoardArticle
  @UseGuards(AuthGuard)
  @Mutation((returns) => BoardArticle)
  public async createBoardArticle(
    @Args('input') input: BoardArticleInput,
    @AuthMember('_id') memberId: ObjectId,
  ) {
    console.log('mutation: createBoardArticle');
    return await this.boardArticleService.createBoardArticle(memberId, input);
  }
  //getBoardArticle
  @UseGuards(WithoutGuard)
  @Query((returns) => BoardArticle)
  public async getBoardArticle(
    @Args('articleId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ) {
    console.log('query: getBoardArticle');
    const articleId = shapeId(input);
    return await this.boardArticleService.getBoardArticle(memberId, articleId);
  }

  //updateBoardArticle
  @UseGuards(AuthGuard)
  @Mutation((returns) => BoardArticle)
  public async updateBoardArticle(
    @Args('input') input: BoardArticleUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ) {
    console.log('mutation: updateBoardArticle');
    input._id = shapeId(input._id);
    return await this.boardArticleService.updateBoardArticle(memberId, input);
  }
  //getBoardArticles
  @UseGuards(WithoutGuard)
  @Query((returns) => BoardArticles)
  public async getBoardArticles(
    @Args('input') input: BoardArticlesInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ) {
    console.log('query: getBoardArticles');
    return await this.boardArticleService.getBoardArticles(memberId, input);
  }

  //liking
  @UseGuards(AuthGuard)
  @Mutation(() => BoardArticle)
  public async likeTargetBoardArticle(
    @Args('articleId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<BoardArticle> {
    console.log('Mutation: likeTargetBoardArticle');
    const targetId = shapeId(input);
    return await this.boardArticleService.likeTargetBoardArticle(
      memberId,
      targetId,
    );
  }

  //admin
  //getAllBoardArticlesByAdmin
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
  //updateBoardArticleByAdmin
  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation((returns) => BoardArticle)
  public async updateBoardArticleByAdmin(
    @Args('input') input: BoardArticleUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ) {
    console.log('mutation: updateBoardArticleByAdmin');
    input._id = shapeId(input._id); //argument.  function
    return await this.boardArticleService.updateBoardArticleByAdmin(input);
  }
  //removeBoardArticle
  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation((returns) => BoardArticle)
  public async removeBoardArticleByAdmin(
    @Args('articleId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ) {
    console.log('mutation: createBoardArticle');
    const articleId = shapeId(input);
    return await this.boardArticleService.removeBoardArticle(articleId);
  }
}
