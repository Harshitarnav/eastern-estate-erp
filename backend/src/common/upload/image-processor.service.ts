import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class ImageProcessorService {
  private readonly logger = new Logger(ImageProcessorService.name);

  // Image processing configuration
  private readonly MAX_WIDTH = 1920;
  private readonly MAX_HEIGHT = 1920;
  private readonly THUMBNAIL_SIZE = 150;
  private readonly QUALITY = 85;

  /**
   * Process and optimize an image
   * - Resize if too large
   * - Compress to reduce file size
   * - Convert to WebP if supported
   */
  async processImage(
    inputPath: string,
    outputPath: string,
    options?: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    },
  ): Promise<{ path: string; size: number }> {
    try {
      const maxWidth = options?.maxWidth || this.MAX_WIDTH;
      const maxHeight = options?.maxHeight || this.MAX_HEIGHT;
      const quality = options?.quality || this.QUALITY;

      const metadata = await sharp(inputPath).metadata();
      
      let pipeline = sharp(inputPath);

      // Resize if image is too large
      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        pipeline = pipeline.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });
        this.logger.log(`Resizing image from ${metadata.width}x${metadata.height}`);
      }

      // Process image
      await pipeline
        .jpeg({ quality, progressive: true })
        .toFile(outputPath);

      const stats = await fs.stat(outputPath);
      
      this.logger.log(`Image processed: ${path.basename(outputPath)} (${this.formatBytes(stats.size)})`);
      
      return {
        path: outputPath,
        size: stats.size,
      };
    } catch (error) {
      this.logger.error(`Failed to process image: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate thumbnail for an image
   */
  async generateThumbnail(
    inputPath: string,
    outputPath: string,
    size: number = this.THUMBNAIL_SIZE,
  ): Promise<{ path: string; size: number }> {
    try {
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      const stats = await fs.stat(outputPath);
      
      this.logger.log(`Thumbnail generated: ${path.basename(outputPath)}`);
      
      return {
        path: outputPath,
        size: stats.size,
      };
    } catch (error) {
      this.logger.error(`Failed to generate thumbnail: ${error.message}`);
      throw error;
    }
  }

  /**
   * Convert image to WebP format
   */
  async convertToWebP(
    inputPath: string,
    outputPath: string,
    quality: number = 85,
  ): Promise<{ path: string; size: number }> {
    try {
      await sharp(inputPath)
        .webp({ quality })
        .toFile(outputPath);

      const stats = await fs.stat(outputPath);
      
      this.logger.log(`Converted to WebP: ${path.basename(outputPath)}`);
      
      return {
        path: outputPath,
        size: stats.size,
      };
    } catch (error) {
      this.logger.error(`Failed to convert to WebP: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get image metadata
   */
  async getMetadata(imagePath: string): Promise<sharp.Metadata> {
    return sharp(imagePath).metadata();
  }

  /**
   * Check if file is an image
   */
  isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Format bytes to human readable size
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
