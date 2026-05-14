import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.use(helmet());

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableShutdownHooks();

  // nestjs-zod-pipes setup
  app.useGlobalPipes(new ZodValidationPipe());

  // Swagger configuration for API documentation
  const config = new DocumentBuilder()
    .setTitle('Products API')
    .setDescription('API for managing products')
    .setVersion('1.0')
    .addTag('products')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Cors configuration to allow requests from specified origins

  const origin = process.env.CORS_ORIGIN?.split(',') || [];
  const methods =
    process.env.CORS_METHODS?.split(',').map((m) => m.trim()) || [];
  app.enableCors({
    origin,
    methods,
    credentials: true,
  });

  app.useLogger(app.get(Logger));

  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
