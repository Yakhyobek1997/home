import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { graphqlUploadExpress } from 'graphql-upload';
import * as express from 'express';

// Define qismi
async function bootstrap() {
	const app = await NestFactory.create(AppModule); // expres + nest
	app.useGlobalPipes(new ValidationPipe());
	// Nesfactoryni olib create methodni call qilib
	// AppModule ni argument sifa past qilib natijatini kutib app ga tenglasht.
	app.useGlobalInterceptors(new LoggingInterceptor());
	app.enableCors({
		origin: true,
		credentials: true,
		methods: ['GET', 'POST', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'x-apollo-operation-name', 'apollo-require-preflight'],
	});

	app.use(graphqlUploadExpress({ maxFileSize: 10 * 1024 * 1024, maxFiles: 14 }));
	app.use('/uploads', express.static('./uploads'));
	await app.listen(process.env.PORT_API ?? 3000);
}

// Call
bootstrap();
