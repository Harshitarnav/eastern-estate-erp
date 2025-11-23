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
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const path = require("path");
const fs = require("fs");
let StorageService = StorageService_1 = class StorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StorageService_1.name);
        this.bucket = this.configService.get('AWS_S3_BUCKET', 'eastern-estate-recordings');
        this.region = this.configService.get('AWS_REGION', 'ap-south-1');
        this.storageType = this.configService.get('RECORDING_STORAGE', 's3').toUpperCase();
        this.localStoragePath = this.configService.get('LOCAL_STORAGE_PATH', './uploads/recordings');
        if (this.storageType === 'S3') {
            const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
            const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
            this.s3Client = new client_s3_1.S3Client({
                region: this.region,
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                },
            });
            this.logger.log(`Storage Service initialized with S3 (bucket: ${this.bucket})`);
        }
        else {
            if (!fs.existsSync(this.localStoragePath)) {
                fs.mkdirSync(this.localStoragePath, { recursive: true });
            }
            this.logger.log(`Storage Service initialized with LOCAL storage (path: ${this.localStoragePath})`);
        }
    }
    async uploadRecording(callSid, recordingBuffer, contentType = 'audio/mpeg') {
        try {
            this.logger.log(`Uploading recording for call ${callSid}`);
            if (this.storageType === 'S3') {
                return await this.uploadToS3(callSid, recordingBuffer, contentType);
            }
            else {
                return await this.uploadToLocal(callSid, recordingBuffer, contentType);
            }
        }
        catch (error) {
            this.logger.error(`Failed to upload recording: ${error.message}`, error.stack);
            throw error;
        }
    }
    async uploadToS3(callSid, recordingBuffer, contentType) {
        const key = this.generateS3Key(callSid);
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: recordingBuffer,
            ContentType: contentType,
            Metadata: {
                callSid: callSid,
                uploadedAt: new Date().toISOString(),
            },
        });
        await this.s3Client.send(command);
        const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
        this.logger.log(`Recording uploaded to S3: ${url}`);
        return {
            url,
            key,
            bucket: this.bucket,
            size: recordingBuffer.length,
        };
    }
    async uploadToLocal(callSid, recordingBuffer, contentType) {
        const key = this.generateLocalKey(callSid);
        const filePath = path.join(this.localStoragePath, key);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, recordingBuffer);
        const url = `/recordings/${key}`;
        this.logger.log(`Recording saved locally: ${filePath}`);
        return {
            url,
            key,
            bucket: 'local',
            size: recordingBuffer.length,
        };
    }
    async downloadRecording(key) {
        try {
            this.logger.log(`Downloading recording: ${key}`);
            if (this.storageType === 'S3') {
                return await this.downloadFromS3(key);
            }
            else {
                return await this.downloadFromLocal(key);
            }
        }
        catch (error) {
            this.logger.error(`Failed to download recording: ${error.message}`, error.stack);
            throw error;
        }
    }
    async downloadFromS3(key) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        const response = await this.s3Client.send(command);
        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        return {
            buffer,
            contentType: response.ContentType || 'audio/mpeg',
            size: buffer.length,
        };
    }
    async downloadFromLocal(key) {
        const filePath = path.join(this.localStoragePath, key);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Recording not found: ${key}`);
        }
        const buffer = fs.readFileSync(filePath);
        const ext = path.extname(key).toLowerCase();
        const contentType = this.getContentType(ext);
        return {
            buffer,
            contentType,
            size: buffer.length,
        };
    }
    async getSignedUrl(key, expiresIn = 3600) {
        if (this.storageType !== 'S3') {
            return `/api/telephony/recordings/${key}`;
        }
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
            this.logger.log(`Generated signed URL for ${key}`);
            return url;
        }
        catch (error) {
            this.logger.error(`Failed to generate signed URL: ${error.message}`);
            throw error;
        }
    }
    async deleteRecording(key) {
        try {
            this.logger.log(`Deleting recording: ${key}`);
            if (this.storageType === 'S3') {
                await this.deleteFromS3(key);
            }
            else {
                await this.deleteFromLocal(key);
            }
            this.logger.log(`Recording deleted: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete recording: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteFromS3(key) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        await this.s3Client.send(command);
    }
    async deleteFromLocal(key) {
        const filePath = path.join(this.localStoragePath, key);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
    generateS3Key(callSid) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `recordings/${year}/${month}/${day}/${callSid}.mp3`;
    }
    generateLocalKey(callSid) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}/${callSid}.mp3`;
    }
    getContentType(ext) {
        const contentTypes = {
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.m4a': 'audio/mp4',
            '.ogg': 'audio/ogg',
        };
        return contentTypes[ext] || 'application/octet-stream';
    }
    async healthCheck() {
        try {
            if (this.storageType === 'S3') {
                const command = new client_s3_1.PutObjectCommand({
                    Bucket: this.bucket,
                    Key: 'health-check.txt',
                    Body: Buffer.from('health check'),
                });
                await this.s3Client.send(command);
                return true;
            }
            else {
                const testFile = path.join(this.localStoragePath, 'health-check.txt');
                fs.writeFileSync(testFile, 'health check');
                fs.unlinkSync(testFile);
                return true;
            }
        }
        catch (error) {
            this.logger.error(`Storage health check failed: ${error.message}`);
            return false;
        }
    }
    async getStatistics() {
        try {
            if (this.storageType === 'LOCAL') {
                return this.getLocalStatistics();
            }
            return {
                type: 'S3',
                bucket: this.bucket,
                region: this.region,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get statistics: ${error.message}`);
            return null;
        }
    }
    getLocalStatistics() {
        try {
            let totalFiles = 0;
            let totalSize = 0;
            const countFiles = (dir) => {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    const stats = fs.statSync(filePath);
                    if (stats.isDirectory()) {
                        countFiles(filePath);
                    }
                    else {
                        totalFiles++;
                        totalSize += stats.size;
                    }
                }
            };
            if (fs.existsSync(this.localStoragePath)) {
                countFiles(this.localStoragePath);
            }
            return {
                type: 'LOCAL',
                path: this.localStoragePath,
                totalFiles,
                totalSizeBytes: totalSize,
                totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get local statistics: ${error.message}`);
            return null;
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map