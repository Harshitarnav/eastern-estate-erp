const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) {
    return fallback;
  }
  return ['true', '1', 'yes'].includes(value.toLowerCase());
};

const toArray = (
  value: string | undefined,
  options: { separator?: string; trim?: boolean } = {},
): string[] | undefined => {
  if (!value) return undefined;
  const separator = options.separator ?? ',';
  const trim = options.trim ?? true;
  return value
    .split(separator)
    .map((item) => (trim ? item.trim() : item))
    .filter(Boolean);
};

export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: toNumber(process.env.PORT, 3001),
    apiPrefix: process.env.API_PREFIX ?? 'api/v1',
    url: process.env.APP_URL ?? 'http://localhost:3001',
  },
  request: {
    bodyLimit: process.env.REQUEST_BODY_LIMIT ?? '1mb',
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: toNumber(process.env.DB_PORT, 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_DATABASE ?? 'postgres',
    logging: toBoolean(process.env.DB_LOGGING, false),
    sslEnabled: toBoolean(process.env.DB_SSL, false),
  },
  security: {
    bcryptRounds: toNumber(process.env.BCRYPT_ROUNDS, 12),
    rateLimitTtl: toNumber(process.env.RATE_LIMIT_TTL, 60),
    rateLimitMax: toNumber(process.env.RATE_LIMIT_MAX, 100),
    maxFileSize: toNumber(process.env.MAX_FILE_SIZE, 10_485_760),
    corsOrigins: toArray(process.env.CORS_ORIGINS),
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiration: process.env.JWT_EXPIRATION ?? '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION ?? '7d',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: toNumber(process.env.REDIS_PORT, 6379),
    password: process.env.REDIS_PASSWORD ?? '',
  },
  storage: {
    endpoint: process.env.MINIO_ENDPOINT ?? 'localhost',
    port: toNumber(process.env.MINIO_PORT, 9000),
    accessKey: process.env.MINIO_ACCESS_KEY ?? '',
    secretKey: process.env.MINIO_SECRET_KEY ?? '',
    useSsl: toBoolean(process.env.MINIO_USE_SSL, false),
    bucket: process.env.MINIO_BUCKET ?? '',
  },
  email: {
    host: process.env.EMAIL_HOST ?? 'smtp.gmail.com',
    port: toNumber(process.env.EMAIL_PORT, 587),
    secure: toBoolean(process.env.EMAIL_SECURE, false),
    user: process.env.EMAIL_USER ?? '',
    password: process.env.EMAIL_PASSWORD ?? '',
    from: process.env.EMAIL_FROM ?? 'noreply@easternestates.com',
    adminEmail: process.env.ADMIN_EMAIL ?? 'admin@easternestates.com',
  },
});
