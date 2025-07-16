import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from 'apps/nestar-api/src/libs/dto/member/member';
import { Property } from 'apps/nestar-api/src/libs/dto/property/property';
import { MemberStatus, MemberType } from 'apps/nestar-api/src/libs/enums/member.enum';
import { PropertyStatus } from 'apps/nestar-api/src/libs/enums/property.enum';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
	// Bu yerda @Injectable() dekoratori bilan BatchService nomli klass e'lon qilingan
	// u dekorator orqali NestJS framework bu servisni provider sifatida
	constructor(
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		// konstruktori ichida ikkita argument borakan,
		// va ikkalasi ham @InjectModel(...) dekoratori orqali Mongoose model sifatida kiritilgan:
	) {}

	public async batchRollback(): Promise<void> {
		await this.propertyModel
			// propertyModel bu Property modelining MongoDB obyekti,
			// bu klassning private readonly property sifatida saqlanadi.
			.updateMany(
				// method
				{ propertyStatus: PropertyStatus.ACTIVE }, // bu query filter (ya’ni qaysi yozuvlarni tanlash)
				{ propertyRank: 0 }, //  bu update data (ya’ni nima o‘zgartiriladi)
			)
			.exec(); // Mongoose’da update buyruqlarini ishga tushirish uchun chaqiriladigan method

		await this.memberModel
			.updateMany(
				// Bu safar memberStatusi ACTIVE va memberTypei
				// AGENT bo‘lgan barcha a’zolarning memberRank qiymati 0 qilib yangilanadi.
				{
					memberStatus: MemberStatus.ACTIVE,
					memberType: MemberType.AGENT,
				},
				{ memberRank: 0 },
			)
			.exec();
		// Asosan bu rollback yoki reset funksiyasi sifatida ishlatilmoqda.
	}

	public async batchTopProperties(): Promise<void> {
		// Bu public async sifatida yozilgan batchTopProperties() methodi bo‘lib,
		// u hech qanday natija qaytarmaydi (Promise<void>), lekin asinxron (async) ishlaydi.
		// // Bu method propertyModel dan ma’lumot olib, ularni hisoblab yangilaydi.
		const properties: Property[] = await this.propertyModel
			// birinchi const properties degan constant yaratilgan.

			.find({
				//find() methodi orqali ma’lumotlar olina
				propertyStatus: PropertyStatus.ACTIVE, // ya’ni aktiv statusga ega bo‘lganlar
				propertyRank: 0, // propertyRank: 0 — va hozircha reytingi 0 bo‘lganlar tanlanadi.
			})
			.exec();

		const promisedList = properties.map(async (ele: Property) => {
			// Keyin promisedList degan yangi constant yaratilgan
			//  Bu yerda .map() methodi orqali har bir Property elementi ustida ishlanadi:
			const { _id, propertyLikes, propertyViews } = ele;
			// Har bir element ele sifatida olinadi va uning ichidan propertylar ajratib olinadi:
			const rank = propertyLikes * 2 + propertyViews * 1;
			// Bu yerda har bir like 2 ball, har bir ko‘rish esa 1 ball deb hisoblanadi.
			//  foydalanuvchi faolligi asosida property uchun reyting balli hisoblanadi.
			return await this.propertyModel.findByIdAndUpdate(_id, {
				// Shundan so‘ng, this.propertyModel.findByIdAndUpdate(...) chaqiriladi
				//  bu method : _id bo‘yicha tegishli
				propertyRank: rank, // document topiladi propertyRank qiymati yangilanadi
			});
		});

		await Promise.all(promisedList);
		//  qo‘shilsa, barcha update’lar to‘liq kutib bajarilishi.
	}

	public async batchTopAgents(): Promise<void> {
		const agents: Member[] = await this.memberModel
			.find({
				memberType: MemberType.AGENT,
				memberStatus: MemberStatus.ACTIVE,
				memberRank: 0,
			})
			.exec();

		const promisedList = agents.map(async (ele: Member) => {
			const { _id, memberProperties, memberLikes, memberArticles, memberViews } = ele;
			const rank = memberProperties * 4 + memberArticles * 3 + memberLikes * 2 + memberViews * 1;
			return await this.memberModel.findByIdAndUpdate(_id, {
				memberRank: rank,
			});
		});

		await Promise.all(promisedList);
	}
}
