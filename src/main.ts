import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { connect } from 'mongoose';
import { CONFIG } from './config';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.listen(CONFIG.PORT);
    await connect(CONFIG.MONGODB_URI);
  } catch (err) {
    throw err;
  }
}

bootstrap();
