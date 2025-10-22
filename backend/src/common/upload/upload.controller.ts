import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe, FilesValidationPipe } from './pipes/file-validation.pipe';
import { ImageProcessorService } from './image-processor.service';
import { LocalStorageService } from './storage/local-storage.service';
import { FileResponseDto } from './dto/upload-file.dto';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly imageProcessor: ImageProcessorService,
    private readonly storage: LocalStorageService,
  ) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile(
      new FileValidationPipe({
        maxSize: 10 * 1024 * 1024,
        required: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<FileResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const response: FileResponseDto = {
      id: file.filename.split('.')[0],
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url: this.storage.getUrl(file.filename),
      uploadedAt: new Date(),
    };

    if (this.imageProcessor.isImage(file.mimetype)) {
      try {
        const thumbnailPath = `thumbnails/${file.filename}`;
        await this.imageProcessor.generateThumbnail(file.path, `./uploads/${thumbnailPath}`);
        response.thumbnailUrl = this.storage.getUrl(thumbnailPath);
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
      }
    }

    return response;
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(
    @UploadedFiles(
      new FilesValidationPipe({
        maxSize: 10 * 1024 * 1024,
        maxCount: 10,
        required: true,
      }),
    )
    files: Express.Multer.File[],
  ): Promise<FileResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    const responses: FileResponseDto[] = [];

    for (const file of files) {
      const response: FileResponseDto = {
        id: file.filename.split('.')[0],
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        url: this.storage.getUrl(file.filename),
        uploadedAt: new Date(),
      };

      if (this.imageProcessor.isImage(file.mimetype)) {
        try {
          const thumbnailPath = `thumbnails/${file.filename}`;
          await this.imageProcessor.generateThumbnail(file.path, `./uploads/${thumbnailPath}`);
          response.thumbnailUrl = this.storage.getUrl(thumbnailPath);
        } catch (error) {
          console.error('Failed to generate thumbnail:', error);
        }
      }

      responses.push(response);
    }

    return responses;
  }
}
