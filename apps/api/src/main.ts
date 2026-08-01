import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
      DocumentBuilder,
      SwaggerModule,
} from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
      const app = await NestFactory.create(AppModule);

      const configService = app.get(ConfigService);

      const port = configService.get<number>('API_PORT') ?? 4000;

      app.setGlobalPrefix('api');

      app.enableCors({
            origin: true,
            credentials: true,
      });

      app.useGlobalPipes(
            new ValidationPipe({
                  whitelist: true,
                  transform: true,
                  forbidNonWhitelisted: true,
            }),
      );

      const swaggerConfig = new DocumentBuilder()
            .setTitle('WorkLink API')
            .setDescription(
                  'API nền tảng kết nối và điều phối nhân sự theo giờ',
            )
            .setVersion('0.2.1')
            .addBearerAuth()
            .build();

      const swaggerDocument = SwaggerModule.createDocument(
            app,
            swaggerConfig,
      );

      SwaggerModule.setup(
            'api/docs',
            app,
            swaggerDocument,
            {
                  jsonDocumentUrl: 'api/docs-json',
            },
      );

      await app.listen(port, '0.0.0.0');

      console.log(`WorkLink API: http://localhost:${port}/api`);
      console.log(
            `Swagger: http://localhost:${port}/api/docs`,
      );
}

void bootstrap();