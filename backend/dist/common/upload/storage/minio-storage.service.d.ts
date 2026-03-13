import { OnModuleInit } from '@nestjs/common';
import { IStorageService } from './storage.interface';
export declare class MinioStorageService implements IStorageService, OnModuleInit {
    private readonly logger;
    private readonly client;
    private readonly bucket;
    constructor();
    onModuleInit(): Promise<void>;
    private ensureBucketExists;
    save(file: Express.Multer.File, key: string): Promise<string>;
    delete(key: string): Promise<void>;
    getUrl(key: string): string;
    exists(key: string): Promise<boolean>;
}
