import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as compression from 'compression';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('app.nodeEnv') ?? 'development';
  const isProduction = nodeEnv === 'production';

  // Serve static files from uploads directory
  const uploadPath = process.env.UPLOAD_LOCATION || './uploads';
  app.useStaticAssets(join(process.cwd(), uploadPath), {
    prefix: '/uploads/',
  });

  // Body parsing limits
  const bodyLimit = configService.get<string>('request.bodyLimit') ?? '1mb';
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));

  const corsOrigins = configService.get<string[]>('security.corsOrigins');
  const allowAllOrigins =
    !corsOrigins || corsOrigins.length === 0 || corsOrigins.includes('*');
  const cspConnectSources = allowAllOrigins
    ? ["'self'", '*']
    : ["'self'", ...corsOrigins];

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'blob:'],
              connectSrc: cspConnectSources,
              fontSrc: ["'self'", 'data:'],
              objectSrc: ["'none'"],
              frameAncestors: ["'none'"],
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );

  // CORS
  app.enableCors({
    origin: allowAllOrigins ? true : corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Disposition'],
  });

  // Compression
  app.use(compression());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // strip unknown props instead of rejecting
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: { target: false, value: false },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints;
          if (constraints) {
            return Object.values(constraints).join('. ');
          }
          return `${error.property} validation failed`;
        }).filter(Boolean);
        
        // Return BadRequestException with array of error messages
        return new BadRequestException(messages);
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // API prefix
  const apiPrefix = configService.get<string>('app.apiPrefix') ?? 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  await app.enableShutdownHooks();
  app.flushLogs();

  const port = configService.get<number>('app.port') ?? 3001;
  const appUrl = configService.get<string>('app.url') ?? `http://localhost:${port}`;
  await app.listen(port);

  console.log(`🚀 Application is running on: ${appUrl}/${apiPrefix}`);
}

bootstrap();
