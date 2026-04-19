import {
  Controller,
  Post,
  Inject,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe, FilesValidationPipe } from './pipes/file-validation.pipe';
import { ImageProcessorService } from './image-processor.service';
import { IStorageService } from './storage/storage.interface';
import { STORAGE_SERVICE } from './storage/storage.token';
import { FileResponseDto } from './dto/upload-file.dto';
import { tmpdir } from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly imageProcessor: ImageProcessorService,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
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
      uploadedAt: new Date(),
      url: '', // filled below
    };

    // Generate thumbnail BEFORE save() - save() deletes the temp file
    if (this.imageProcessor.isImage(file.mimetype)) {
      const thumbKey = `thumbnails/${file.filename}`;
      const thumbTempPath = path.join(tmpdir(), `thumb_${file.filename}`);
      try {
        await this.imageProcessor.generateThumbnail(file.path, thumbTempPath);

        const thumbStats = await fs.stat(thumbTempPath);
        const thumbFile = {
          path: thumbTempPath,
          filename: thumbKey,
          originalname: `thumb_${file.originalname}`,
          mimetype: 'image/jpeg',
          size: thumbStats.size,
        } as Express.Multer.File;

        await this.storage.save(thumbFile, thumbKey);
        response.thumbnailUrl = this.storage.getUrl(thumbKey);
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
        // Clean up thumb temp file if it was created
        await fs.unlink(thumbTempPath).catch(() => {});
      }
    }

    // Save the main file (moves from tmpdir to final destination)
    try {
      await this.storage.save(file, file.filename);
    } catch (err: any) {
      if (err?.code === 'ECONNREFUSED' || err?.name === 'AggregateError') {
        throw new ServiceUnavailableException(
          'File storage is unavailable right now. Please try again later or contact your administrator.',
        );
      }
      throw err;
    }
    response.url = this.storage.getUrl(file.filename);

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
        uploadedAt: new Date(),
        url: '',
      };

      // Thumbnail before save()
      if (this.imageProcessor.isImage(file.mimetype)) {
        const thumbKey = `thumbnails/${file.filename}`;
        const thumbTempPath = path.join(tmpdir(), `thumb_${file.filename}`);
        try {
          await this.imageProcessor.generateThumbnail(file.path, thumbTempPath);

          const thumbStats = await fs.stat(thumbTempPath);
          const thumbFile = {
            path: thumbTempPath,
            filename: thumbKey,
            originalname: `thumb_${file.originalname}`,
            mimetype: 'image/jpeg',
            size: thumbStats.size,
          } as Express.Multer.File;

          await this.storage.save(thumbFile, thumbKey);
          response.thumbnailUrl = this.storage.getUrl(thumbKey);
        } catch (error) {
          console.error('Failed to generate thumbnail:', error);
          await fs.unlink(thumbTempPath).catch(() => {});
        }
      }

      try {
        await this.storage.save(file, file.filename);
      } catch (err: any) {
        if (err?.code === 'ECONNREFUSED' || err?.name === 'AggregateError') {
          throw new ServiceUnavailableException(
            'File storage is unavailable right now. Please try again later or contact your administrator.',
          );
        }
        throw err;
      }
      response.url = this.storage.getUrl(file.filename);

      responses.push(response);
    }

    return responses;
  }
}
