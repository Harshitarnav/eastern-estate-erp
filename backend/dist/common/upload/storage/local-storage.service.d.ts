import { IStorageService } from './storage.interface';
export declare class LocalStorageService implements IStorageService {
    private readonly logger;
    private readonly uploadPath;
    private readonly baseUrl;
    constructor();
    save(file: Express.Multer.File, relativePath: string): Promise<string>;
    delete(relativePath: string): Promise<void>;
    getUrl(relativePath: string): string;
    exists(relativePath: string): Promise<boolean>;
}
