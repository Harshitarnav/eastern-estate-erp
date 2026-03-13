import { ImageProcessorService } from './image-processor.service';
import { IStorageService } from './storage/storage.interface';
import { FileResponseDto } from './dto/upload-file.dto';
export declare class UploadController {
    private readonly imageProcessor;
    private readonly storage;
    constructor(imageProcessor: ImageProcessorService, storage: IStorageService);
    uploadSingle(file: Express.Multer.File): Promise<FileResponseDto>;
    uploadMultiple(files: Express.Multer.File[]): Promise<FileResponseDto[]>;
}
