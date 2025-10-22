import { ImageProcessorService } from './image-processor.service';
import { LocalStorageService } from './storage/local-storage.service';
import { FileResponseDto } from './dto/upload-file.dto';
export declare class UploadController {
    private readonly imageProcessor;
    private readonly storage;
    constructor(imageProcessor: ImageProcessorService, storage: LocalStorageService);
    uploadSingle(file: Express.Multer.File): Promise<FileResponseDto>;
    uploadMultiple(files: Express.Multer.File[]): Promise<FileResponseDto[]>;
}
