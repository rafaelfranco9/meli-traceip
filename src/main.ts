import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const PORT = config.get<string>('PORT');
  await app.listen(PORT || 3000, () =>
    Logger.log(`Server listening in port ${PORT}`, 'App'),
  );
}
bootstrap();
