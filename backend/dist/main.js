"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const compression = require("compression");
const helmet_1 = require("helmet");
const express_1 = require("express");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
        logger: process.env.NODE_ENV === 'production'
            ? ['error', 'warn', 'log']
            : ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    const nodeEnv = configService.get('app.nodeEnv') ?? 'development';
    const isProduction = nodeEnv === 'production';
    const bodyLimit = configService.get('request.bodyLimit') ?? '1mb';
    app.use((0, express_1.json)({ limit: bodyLimit }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: bodyLimit }));
    const corsOrigins = configService.get('security.corsOrigins');
    const allowAllOrigins = !corsOrigins || corsOrigins.length === 0 || corsOrigins.includes('*');
    const cspConnectSources = allowAllOrigins
        ? ["'self'", '*']
        : ["'self'", ...corsOrigins];
    app.use((0, helmet_1.default)({
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
    }));
    app.enableCors({
        origin: allowAllOrigins ? true : corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        exposedHeaders: ['Content-Disposition'],
    });
    app.use(compression());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
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
            return new common_1.BadRequestException(messages);
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const apiPrefix = configService.get('app.apiPrefix') ?? 'api/v1';
    app.setGlobalPrefix(apiPrefix);
    await app.enableShutdownHooks();
    app.flushLogs();
    const port = configService.get('app.port') ?? 3001;
    const appUrl = configService.get('app.url') ?? `http://localhost:${port}`;
    await app.listen(port);
    console.log(`🚀 Application is running on: ${appUrl}/${apiPrefix}`);
}
bootstrap();
//# sourceMappingURL=main.js.map