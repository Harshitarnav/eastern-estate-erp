import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(
    private readonly options?: {
      maxSize?: number;
      allowedTypes?: string[];
      required?: boolean;
    },
  ) {}

  transform(file: Express.Multer.File) {
    if (!file && this.options?.required) {
      throw new BadRequestException('File is required');
    }

    if (!file) {
      return file;
    }

    // Validate file size
    if (this.options?.maxSize && file.size > this.options.maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.formatBytes(this.options.maxSize)}`,
      );
    }

    // Validate file type
    if (this.options?.allowedTypes && !this.options.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.options.allowedTypes.join(', ')}`,
      );
    }

    return file;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

@Injectable()
export class FilesValidationPipe implements PipeTransform {
  constructor(
    private readonly options?: {
      maxSize?: number;
      maxCount?: number;
      allowedTypes?: string[];
      required?: boolean;
    },
  ) {}

  transform(files: Express.Multer.File[]) {
    if ((!files || files.length === 0) && this.options?.required) {
      throw new BadRequestException('At least one file is required');
    }

    if (!files || files.length === 0) {
      return files;
    }

    // Validate max count
    if (this.options?.maxCount && files.length > this.options.maxCount) {
      throw new BadRequestException(
        `Maximum ${this.options.maxCount} files allowed. Received ${files.length} files.`,
      );
    }

    // Validate each file
    files.forEach((file, index) => {
      if (this.options?.maxSize && file.size > this.options.maxSize) {
        throw new BadRequestException(
          `File ${index + 1} size exceeds maximum allowed size of ${this.formatBytes(this.options.maxSize)}`,
        );
      }

      if (this.options?.allowedTypes && !this.options.allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `File ${index + 1} type ${file.mimetype} is not allowed`,
        );
      }
    });

    return files;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
