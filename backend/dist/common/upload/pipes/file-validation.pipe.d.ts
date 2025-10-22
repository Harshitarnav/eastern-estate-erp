import { PipeTransform } from '@nestjs/common';
export declare class FileValidationPipe implements PipeTransform {
    private readonly options?;
    constructor(options?: {
        maxSize?: number;
        allowedTypes?: string[];
        required?: boolean;
    });
    transform(file: Express.Multer.File): Express.Multer.File;
    private formatBytes;
}
export declare class FilesValidationPipe implements PipeTransform {
    private readonly options?;
    constructor(options?: {
        maxSize?: number;
        maxCount?: number;
        allowedTypes?: string[];
        required?: boolean;
    });
    transform(files: Express.Multer.File[]): Express.Multer.File[];
    private formatBytes;
}
