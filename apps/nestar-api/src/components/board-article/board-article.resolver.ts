import { BoardArticleService } from './board-article.service';
import { BoardArticle } from './../../libs/board-article/board-article';
import { Resolver } from '@nestjs/graphql';

@Resolver()
export class BoardArticleResolver {
    constructor(private readonly BoardArticleService: BoardArticleService) {}
}
