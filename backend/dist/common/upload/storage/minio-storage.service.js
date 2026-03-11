"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MinioStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioStorageService = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const fs = require("fs/promises");
let MinioStorageService = MinioStorageService_1 = class MinioStorageService {
    constructor() {
        this.logger = new common_1.Logger(MinioStorageService_1.name);
        const endpoint = process.env.MINIO_ENDPOINT || 'minio';
        const port = parseInt(process.env.MINIO_PORT || '9000', 10);
        const useSSL = process.env.MINIO_USE_SSL === 'true';
        this.bucket = process.env.MINIO_BUCKET || 'eastern-estate';
        this.client = new client_s3_1.S3Client({
            endpoint: `${useSSL ? 'https' : 'http'}://${endpoint}:${port}`,
            credentials: {
                accessKeyId: process.env.MINIO_ACCESS_KEY || 'minio_access_key',
                secretAccessKey: process.env.MINIO_SECRET_KEY || 'minio_secret_key',
            },
            region: 'us-east-1',
            forcePathStyle: true,
        });
    }
    async onModuleInit() {
        try {
            await this.ensureBucketExists();
        }
        catch (err) {
            this.logger.error(`MinIO initialisation failed: ${err.message}`);
        }
    }
    async ensureBucketExists() {
        try {
            await this.client.send(new client_s3_1.HeadBucketCommand({ Bucket: this.bucket }));
            this.logger.log(`MinIO bucket '${this.bucket}' already exists`);
        }
        catch {
            await this.client.send(new client_s3_1.CreateBucketCommand({ Bucket: this.bucket }));
            this.logger.log(`Created MinIO bucket '${this.bucket}'`);
        }
        const policy = JSON.stringify({
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Allow',
                    Principal: { AWS: ['*'] },
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${this.bucket}/*`],
                },
            ],
        });
        try {
            await this.client.send(new client_s3_1.PutBucketPolicyCommand({ Bucket: this.bucket, Policy: policy }));
            this.logger.log(`Public-read policy applied to bucket '${this.bucket}'`);
        }
        catch (err) {
            this.logger.warn(`Could not set bucket policy: ${err.message}`);
        }
    }
    async save(file, key) {
        const buffer = await fs.readFile(file.path);
        await this.client.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: file.mimetype || 'application/octet-stream',
            ContentLength: buffer.length,
        }));
        await fs.unlink(file.path).catch(() => { });
        this.logger.log(`Uploaded to MinIO: ${key} (${buffer.length} bytes)`);
        return key;
    }
    async delete(key) {
        try {
            await this.client.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
            this.logger.log(`Deleted from MinIO: ${key}`);
        }
        catch (err) {
            this.logger.warn(`Could not delete from MinIO '${key}': ${err.message}`);
        }
    }
    getUrl(key) {
        return `/files/${key}`;
    }
    async exists(key) {
        try {
            await this.client.send(new client_s3_1.HeadObjectCommand({ Bucket: this.bucket, Key: key }));
            return true;
        }
        catch {
            return false;
        }
    }
};
exports.MinioStorageService = MinioStorageService;
exports.MinioStorageService = MinioStorageService = MinioStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MinioStorageService);
//# sourceMappingURL=minio-storage.service.js.map