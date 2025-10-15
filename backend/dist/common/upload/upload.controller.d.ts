import { Response } from 'express';
export declare class UploadController {
    uploadPropertyImages(files: Express.Multer.File[]): Promise<{
        success: boolean;
        urls: string[];
        count: number;
    }>;
    uploadPropertyDocuments(files: Express.Multer.File[]): Promise<{
        success: boolean;
        urls: string[];
        count: number;
    }>;
    uploadKYCDocuments(files: Express.Multer.File[]): Promise<{
        success: boolean;
        urls: string[];
        count: number;
    }>;
    uploadPaymentReceipt(file: Express.Multer.File): Promise<{
        success: boolean;
        url: string;
        filename: string;
    }>;
    uploadProfilePicture(file: Express.Multer.File): Promise<{
        success: boolean;
        url: string;
    }>;
    serveFile(folder: string, filename: string, res: Response): Promise<void>;
}
