import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as path from 'path';
import * as fs from 'fs';

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
}

export interface DownloadResult {
  buffer: Buffer;
  contentType: string;
  size: number;
}

/**
 * Storage Service for call recordings
 * Supports AWS S3 and local file storage
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly storageType: 'S3' | 'LOCAL';
  private readonly localStoragePath: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET', 'eastern-estate-recordings');
    this.region = this.configService.get<string>('AWS_REGION', 'ap-south-1');
    this.storageType = this.configService.get<string>('RECORDING_STORAGE', 's3').toUpperCase() as any;
    this.localStoragePath = this.configService.get<string>('LOCAL_STORAGE_PATH', './uploads/recordings');

    if (this.storageType === 'S3') {
      const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
      const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      this.logger.log(`Storage Service initialized with S3 (bucket: ${this.bucket})`);
    } else {
      // Ensure local storage directory exists
      if (!fs.existsSync(this.localStoragePath)) {
        fs.mkdirSync(this.localStoragePath, { recursive: true });
      }
      this.logger.log(`Storage Service initialized with LOCAL storage (path: ${this.localStoragePath})`);
    }
  }

  /**
   * Upload recording to storage
   */
  async uploadRecording(
    callSid: string,
    recordingBuffer: Buffer,
    contentType: string = 'audio/mpeg',
  ): Promise<UploadResult> {
    try {
      this.logger.log(`Uploading recording for call ${callSid}`);

      if (this.storageType === 'S3') {
        return await this.uploadToS3(callSid, recordingBuffer, contentType);
      } else {
        return await this.uploadToLocal(callSid, recordingBuffer, contentType);
      }
    } catch (error) {
      this.logger.error(`Failed to upload recording: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Upload to AWS S3
   */
  private async uploadToS3(
    callSid: string,
    recordingBuffer: Buffer,
    contentType: string,
  ): Promise<UploadResult> {
    const key = this.generateS3Key(callSid);
    
    const command = new PutObjectCommand({
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

  /**
   * Upload to local file system
   */
  private async uploadToLocal(
    callSid: string,
    recordingBuffer: Buffer,
    contentType: string,
  ): Promise<UploadResult> {
    const key = this.generateLocalKey(callSid);
    const filePath = path.join(this.localStoragePath, key);

    // Ensure directory exists
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

  /**
   * Download recording from storage
   */
  async downloadRecording(key: string): Promise<DownloadResult> {
    try {
      this.logger.log(`Downloading recording: ${key}`);

      if (this.storageType === 'S3') {
        return await this.downloadFromS3(key);
      } else {
        return await this.downloadFromLocal(key);
      }
    } catch (error) {
      this.logger.error(`Failed to download recording: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Download from AWS S3
   */
  private async downloadFromS3(key: string): Promise<DownloadResult> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.s3Client.send(command);

    const chunks: Buffer[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    return {
      buffer,
      contentType: response.ContentType || 'audio/mpeg',
      size: buffer.length,
    };
  }

  /**
   * Download from local file system
   */
  private async downloadFromLocal(key: string): Promise<DownloadResult> {
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

  /**
   * Get signed URL for secure download (S3 only)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (this.storageType !== 'S3') {
      return `/api/telephony/recordings/${key}`;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      
      this.logger.log(`Generated signed URL for ${key}`);
      
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete recording from storage
   */
  async deleteRecording(key: string): Promise<void> {
    try {
      this.logger.log(`Deleting recording: ${key}`);

      if (this.storageType === 'S3') {
        await this.deleteFromS3(key);
      } else {
        await this.deleteFromLocal(key);
      }

      this.logger.log(`Recording deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete recording: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete from AWS S3
   */
  private async deleteFromS3(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  /**
   * Delete from local file system
   */
  private async deleteFromLocal(key: string): Promise<void> {
    const filePath = path.join(this.localStoragePath, key);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Generate S3 key for recording
   */
  private generateS3Key(callSid: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `recordings/${year}/${month}/${day}/${callSid}.mp3`;
  }

  /**
   * Generate local file path key
   */
  private generateLocalKey(callSid: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}/${month}/${day}/${callSid}.mp3`;
  }

  /**
   * Get content type from file extension
   */
  private getContentType(ext: string): string {
    const contentTypes: Record<string, string> = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.ogg': 'audio/ogg',
    };

    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Check if storage is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (this.storageType === 'S3') {
        // Try to list bucket (minimal operation)
        const command = new PutObjectCommand({
          Bucket: this.bucket,
          Key: 'health-check.txt',
          Body: Buffer.from('health check'),
        });
        await this.s3Client.send(command);
        return true;
      } else {
        // Check if local directory is writable
        const testFile = path.join(this.localStoragePath, 'health-check.txt');
        fs.writeFileSync(testFile, 'health check');
        fs.unlinkSync(testFile);
        return true;
      }
    } catch (error) {
      this.logger.error(`Storage health check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  async getStatistics(): Promise<any> {
    try {
      if (this.storageType === 'LOCAL') {
        return this.getLocalStatistics();
      }
      
      // For S3, we would need to implement listing and calculating
      // which can be expensive, so we return basic info
      return {
        type: 'S3',
        bucket: this.bucket,
        region: this.region,
      };
    } catch (error) {
      this.logger.error(`Failed to get statistics: ${error.message}`);
      return null;
    }
  }

  /**
   * Get statistics for local storage
   */
  private getLocalStatistics(): any {
    try {
      let totalFiles = 0;
      let totalSize = 0;

      const countFiles = (dir: string) => {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory()) {
            countFiles(filePath);
          } else {
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
    } catch (error) {
      this.logger.error(`Failed to get local statistics: ${error.message}`);
      return null;
    }
  }
}

