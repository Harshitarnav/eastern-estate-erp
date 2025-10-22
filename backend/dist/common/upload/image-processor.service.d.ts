import * as sharp from 'sharp';
export declare class ImageProcessorService {
    private readonly logger;
    private readonly MAX_WIDTH;
    private readonly MAX_HEIGHT;
    private readonly THUMBNAIL_SIZE;
    private readonly QUALITY;
    processImage(inputPath: string, outputPath: string, options?: {
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
    }): Promise<{
        path: string;
        size: number;
    }>;
    generateThumbnail(inputPath: string, outputPath: string, size?: number): Promise<{
        path: string;
        size: number;
    }>;
    convertToWebP(inputPath: string, outputPath: string, quality?: number): Promise<{
        path: string;
        size: number;
    }>;
    getMetadata(imagePath: string): Promise<sharp.Metadata>;
    isImage(mimeType: string): boolean;
    private formatBytes;
}
