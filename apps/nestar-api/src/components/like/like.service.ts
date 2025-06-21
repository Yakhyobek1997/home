import { InjectModel } from '@nestjs/mongoose';
import { LikeModule } from './like.module';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Like } from '../../libs/dto/like/like';

@Injectable()
export class LikeService {
    constructor(@InjectModel('like') private readonly LikeModule: Model<Like>) {}
}
