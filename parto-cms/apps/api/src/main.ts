// ============================================
// Parto CMS — API Entry Point
// ============================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global prefix FIRST
  app.setGlobalPrefix('api/v1');

  // Serve uploaded files (after prefix so they work correctly)
  app.use('/uploads', express.static(uploadsDir));

  // CORS
  app.enableCors({
    origin: [
      process.env.ADMIN_URL || 'http://localhost:3000',
      'http://localhost:3003',
      'http://localhost:3000',
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Parto CMS API')
    .setDescription('REST API for Parto Event Group CMS')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & authorization')
    .addTag('users', 'User management')
    .addTag('projects', 'Project portfolio')
    .addTag('clients', 'Client management')
    .addTag('services', 'Service offerings')
    .addTag('team', 'Team members')
    .addTag('media', 'Media library')
    .addTag('menus', 'Navigation menus')
    .addTag('pages', 'Content pages')
    .addTag('posts', 'Blog posts')
    .addTag('settings', 'Site settings')
    .addTag('forms', 'Form submissions')
    .addTag('search', 'Global search')
    .addTag('ai', 'AI-powered features')
    .addTag('dashboard', 'Analytics & dashboard')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.API_PORT || 3006;
  await app.listen(port);

  console.log(`🚀 Parto CMS API running on http://localhost:${port}`);
  console.log(`📚 API docs at http://localhost:${port}/docs`);
}

bootstrap();