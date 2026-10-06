/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

// reflect-metadata must load before any decorated class so Nest can read
// the metadata emitted by emitDecoratorMetadata (DI + route reflection).
import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Generate the OpenAPI document from the controllers and serve it with Scalar.
  const config = new DocumentBuilder()
    .setTitle('Level Up API')
    .setDescription('The Level Up API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  app.use('/reference', apiReference({ content: document }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(`📚 API reference: http://localhost:${port}/reference`);
}

bootstrap();
