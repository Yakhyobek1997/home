import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class LikeService {
	constructor(@InjectModel('like') private readonly likeModel: Model<Like>) {}
	// u constructor orqali biz likeModel degan Mongoose modelni servis ichiga ulab oldik.
	// U bizga MongoDB'ga like data yozish imkonini beradi

	public async toggleLike(input: LikeInput): Promise<number> {
		// public async  toggleLike methodi bitta input argumetni qabul qilib
		const search: T = { memberId: input.memberId, likeRefId: input.likeRefId };
		// Bu yerda biz search degan obyekt yaratdik.obyekt MongoDB'dan memberId va likeRefId 
		// ni like mavjudligini tekshirish uchun ishlatiladi
		const exist = await this.likeModel.findOne(search).exec();
		let modifier = 1;
		// Bu yerda likeModeldan memberId va likeRefId bo‘yicha 
		// oldin like bosilganmi yo‘qmi – shuni tekshiryapmiz.
		// gar exist degan natija true bo‘lsa, demak allaqachon like bosilgan
		// modifier esa biz keyinchalik like qo‘shdikmi
		// yoki olib tashladikmi — shuni belgilash uchun ishlatiladi.

		// Bu yerda exist ya’ni like bor-yo‘qligini tekshirdik
		if (exist) { // . Agar like avval bosilgan bo‘lsa, foydalanuvchi uni bekor qilmoqchi degani,
			await this.likeModel.findOneAndDelete(search).exec();
			modifier = -1;
		} else {
			try { // agar like hali yo‘q bo‘lsa — create() bilan uni bazaga yangi qilib qo‘shdik.
				await this.likeModel.create(input);
			} catch (err) {
	// Har ehtimolga qarshi try-catch ichida ishlatyapmiz
	// bu xatolik bo‘lsa to‘g‘ri tutib ishlov berish uchun
				console.log('Error, Service.model:', err.message);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}

		console.log(`~ Like modifier ${modifier} ~`);
// Bu joyda foydalanuvchi like bosganmi yoki bekor qilganmi
// shuni modifier orqali ajratamiz va logga chiqarib,reurn qivommiz
		return modifier;
	}

	public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
		const { memberId, likeRefId } = input;
		//  foydalanuvchi (memberId) berilgan postga yoki obyektga (likeRefId) like bosganmi yoki yo‘qmi.
		const result = await this.likeModel.findOne({ memberId: memberId, likeRefId: likeRefId }).exec();
		return result ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }] : [];
		// Agar like bosgan bo‘lsa, bu haqda myFavorite: true bo‘lgan ma’lumot qaytariladi. Aks holda bo‘sh array qaytariladi.
	}
}
