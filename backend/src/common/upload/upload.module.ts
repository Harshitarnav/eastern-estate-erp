import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ImageProcessorService } from './image-processor.service';
import { LocalStorageService } from './storage/local-storage.service';
import { UploadController } from './upload.controller';
import { multerConfig } from './multer.config';

@Module({
  imports: [MulterModule.register(multerConfig)],
  controllers: [UploadController],
  providers: [ImageProcessorService, LocalStorageService],
  exports: [ImageProcessorService, LocalStorageService, MulterModule],
})
export class UploadModule {}
