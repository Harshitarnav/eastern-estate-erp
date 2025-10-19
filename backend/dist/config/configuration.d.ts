declare const _default: () => {
    app: {
        nodeEnv: string;
        port: number;
        apiPrefix: string;
        url: string;
    };
    request: {
        bodyLimit: string;
    };
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
        logging: boolean;
        sslEnabled: boolean;
    };
    security: {
        bcryptRounds: number;
        rateLimitTtl: number;
        rateLimitMax: number;
        maxFileSize: number;
        corsOrigins: string[];
    };
    jwt: {
        secret: string;
        expiration: string;
        refreshSecret: string;
        refreshExpiration: string;
    };
    redis: {
        host: string;
        port: number;
        password: string;
    };
    storage: {
        endpoint: string;
        port: number;
        accessKey: string;
        secretKey: string;
        useSsl: boolean;
        bucket: string;
    };
};
export default _default;
