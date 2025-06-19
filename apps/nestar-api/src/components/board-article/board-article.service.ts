import { BoardArticle } from './../../libs/board-article/board-article';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BoardArticleService {
    constructor(@InjectModel('BoardArticle') private readonly BoardArticleModel: Model<BoardArticle>) {}
}
