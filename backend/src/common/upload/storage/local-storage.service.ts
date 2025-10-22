import { Injectable, Logger } from '@nestjs/common';
import { IStorageService } from './storage.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadPath: string;
  private readonly baseUrl: string;

  constructor() {
    this.uploadPath = process.env.UPLOAD_LOCATION || './uploads';
    this.baseUrl = process.env.APP_URL || 'http://localhost:3001';
  }

  async save(file: Express.Multer.File, relativePath: string): Promise<string> {
    try {
      const fullPath = path.join(this.uploadPath, relativePath);
      const dir = path.dirname(fullPath);

      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true });

      // Move file to destination
      await fs.copyFile(file.path, fullPath);
      await fs.unlink(file.path); // Remove temporary file

      this.logger.log(`File saved: ${relativePath}`);
      return relativePath;
    } catch (error) {
      this.logger.error(`Failed to save file: ${error.message}`);
      throw error;
    }
  }

  async delete(relativePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadPath, relativePath);
      await fs.unlink(fullPath);
      this.logger.log(`File deleted: ${relativePath}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw error;
    }
  }

  getUrl(relativePath: string): string {
    return `${this.baseUrl}/uploads/${relativePath}`;
  }

  async exists(relativePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadPath, relativePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
