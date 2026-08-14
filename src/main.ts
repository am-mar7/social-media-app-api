import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      // only allows properties defiend in DTO
      whitelist: true,
      // throw an error if extra properities provided
      forbidNonWhitelisted: true,
      // convert incoming data to match types defined in DTO
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  // Swagger / OpenAPI setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Social Media API')
    .setDescription('API documentation for the Social Media app')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  // Apply a global security requirement so endpoints show auth without decorators
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (swaggerDocument as any).security = [{ 'access-token': [] }];
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    customSiteTitle: 'Social Media API Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCss:
      '.swagger-ui .topbar { background: #111827; } .swagger-ui .topbar a span { color: #fff }',
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
