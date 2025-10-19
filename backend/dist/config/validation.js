"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchema = void 0;
const Joi = require("joi");
exports.validationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().port().default(3001),
    API_PREFIX: Joi.string().default('api/v1'),
    APP_URL: Joi.string().uri().allow('').default('http://localhost:3001'),
    REQUEST_BODY_LIMIT: Joi.string().default('1mb'),
    DB_HOST: Joi.string().hostname().required(),
    DB_PORT: Joi.number().port().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().allow('').default(''),
    DB_DATABASE: Joi.string().required(),
    DB_LOGGING: Joi.boolean().truthy('true').falsy('false').default(false),
    DB_SSL: Joi.boolean().truthy('true').falsy('false').default(false),
    JWT_SECRET: Joi.string().min(32).required(),
    JWT_EXPIRATION: Joi.string().default('24h'),
    JWT_REFRESH_SECRET: Joi.string().min(32).required(),
    JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
    REDIS_HOST: Joi.string().hostname().required(),
    REDIS_PORT: Joi.number().port().default(6379),
    REDIS_PASSWORD: Joi.string().allow('').default(''),
    MAX_FILE_SIZE: Joi.number().positive().default(10_485_760),
    BCRYPT_ROUNDS: Joi.number().integer().min(4).max(15).default(12),
    RATE_LIMIT_TTL: Joi.number().positive().default(60),
    RATE_LIMIT_MAX: Joi.number().positive().default(100),
    CORS_ORIGINS: Joi.string().allow('').optional(),
    MINIO_ENDPOINT: Joi.string().hostname().required(),
    MINIO_PORT: Joi.number().port().default(9000),
    MINIO_ACCESS_KEY: Joi.string().required(),
    MINIO_SECRET_KEY: Joi.string().required(),
    MINIO_USE_SSL: Joi.boolean().truthy('true').falsy('false').default(false),
    MINIO_BUCKET: Joi.string().required(),
});
//# sourceMappingURL=validation.js.map