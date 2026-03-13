import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import * as fs from 'fs/promises';
import { IStorageService } from './storage.interface';

@Injectable()
export class MinioStorageService implements IStorageService, OnModuleInit {
  private readonly logger = new Logger(MinioStorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT || 'minio';
    const port = parseInt(process.env.MINIO_PORT || '9000', 10);
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    this.bucket = process.env.MINIO_BUCKET || 'eastern-estate';

    this.client = new S3Client({
      endpoint: `${useSSL ? 'https' : 'http'}://${endpoint}:${port}`,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'minio_access_key',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'minio_secret_key',
      },
      region: 'us-east-1', // MinIO ignores this; AWS SDK requires a value
      forcePathStyle: true, // Required for MinIO (path-style vs virtual-hosted)
    });
  }

  async onModuleInit() {
    try {
      await this.ensureBucketExists();
    } catch (err) {
      this.logger.error(`MinIO initialisation failed: ${err.message}`);
    }
  }

  private async ensureBucketExists(): Promise<void> {
    // Check or create the bucket
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`MinIO bucket '${this.bucket}' already exists`);
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Created MinIO bucket '${this.bucket}'`);
    }

    // Set public-read policy so Caddy can proxy without auth
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
      await this.client.send(
        new PutBucketPolicyCommand({ Bucket: this.bucket, Policy: policy }),
      );
      this.logger.log(`Public-read policy applied to bucket '${this.bucket}'`);
    } catch (err) {
      this.logger.warn(`Could not set bucket policy: ${err.message}`);
    }
  }

  /**
   * Upload a file (from its temp path on disk) to MinIO.
   * Deletes the local temp file after successful upload.
   */
  async save(file: Express.Multer.File, key: string): Promise<string> {
    const buffer = await fs.readFile(file.path);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: file.mimetype || 'application/octet-stream',
        ContentLength: buffer.length,
      }),
    );

    // Remove the local temp file
    await fs.unlink(file.path).catch(() => {});

    this.logger.log(`Uploaded to MinIO: ${key} (${buffer.length} bytes)`);
    return key;
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      this.logger.log(`Deleted from MinIO: ${key}`);
    } catch (err) {
      this.logger.warn(`Could not delete from MinIO '${key}': ${err.message}`);
    }
  }

  /**
   * Returns a URL that Caddy proxies to MinIO.
   * Pattern: /files/<key>  →  Caddy  →  minio:9000/<bucket>/<key>
   * This keeps the same relative-URL pattern as LocalStorageService (/uploads/…).
   */
  getUrl(key: string): string {
    return `/files/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }
}
