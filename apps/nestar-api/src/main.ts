import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


// Define qismi
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Nesfactoryni olib create methodni call qilib
  // AppModule ni argument sifa past qilib natijatini kutib app ga tenglasht.
  await app.listen(process.env.PORT_API ?? 3000);
}

// Call
bootstrap();
