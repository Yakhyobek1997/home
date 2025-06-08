import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// Define qismi
async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe());
	// Nesfactoryni olib create methodni call qilib
	// AppModule ni argument sifa past qilib natijatini kutib app ga tenglasht.
	await app.listen(process.env.PORT_API ?? 3000);
}

// Call
bootstrap();
