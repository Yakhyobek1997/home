import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { graphqlUploadExpress } from 'graphql-upload';
import * as express from 'express';
import { WsAdapter } from '@nestjs/platform-ws';

// Define qismi
async function bootstrap() {
	const app = await NestFactory.create(AppModule); // expres + nest
	app.useGlobalPipes(new ValidationPipe());
	// Nesfactoryni olib create methodni call qilib
	// AppModule ni argument sifa past qilib natijatini kutib app ga tenglasht.
	app.useGlobalInterceptors(new LoggingInterceptor());
	//  so‘rovlar va javoblar oqimini o‘zgartirishi, log yuritishi, transformatsiya qilish
	app.enableCors({ // Cross-Origin Resource Sharing.
	// frontend backend (NestJS) bir-biriga boshqa domenlardan murojaat qilganda ruxsat berish.
		origin: true, // domenni ruxsat beradi
		credentials: true, // cookie, auth header va boshqa credential’larni yuborishga ruxsat.
		methods: ['GET', 'POST', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'x-apollo-operation-name', 'apollo-require-preflight'],
		// GraphQL headerlar qo‘shilgan
	});

	app.use(graphqlUploadExpress({ maxFileSize: 10 * 1024 * 1024, maxFiles: 14 }));
	// Bu Express middleware yordamida GraphQL uchun fayl yuklashni yoqadi.
	// maxFileSize: 10MB maksimal fayl hajmi,
	// maxFiles: bir vaqtning o‘zida 14 tagacha fayl
	app.use('/uploads', express.static('./uploads'));
	// Bu orqali /uploads URL orqali ./uploads papkadagi fayllar static resurs sifatida ko‘rsatiladi.
	app.useWebSocketAdapter(new WsAdapter(app))
	// WsAdapter odatda real-time chat
	//  notifikatsiyalar yoki onlayn foydalanuvchilarni kuzatish uchun kerak bo‘ladi.
	await app.listen(process.env.PORT_API ?? 3000);
}

// Call
bootstrap();


// Nestjs paradigmalari
// Obejct orient
// Aspect orient