import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  app.enableCors({
    origin: [
      /^http:\/\/localhost(:\d+)?$/,   // any localhost port (Angular, Flutter web, etc.)
      /^http:\/\/127\.0\.0\.1(:\d+)?$/,
      ...(process.env.ALLOWED_ORIGINS?.split(',') ?? []),
    ],
    credentials: true,
  });

  // Serve uploaded files at /uploads/*
  app.useStaticAssets(path.resolve(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
