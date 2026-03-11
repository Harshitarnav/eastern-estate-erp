import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ImageProcessorService } from './image-processor.service';
import { LocalStorageService } from './storage/local-storage.service';
import { MinioStorageService } from './storage/minio-storage.service';
import { STORAGE_SERVICE } from './storage/storage.token';
import { UploadController } from './upload.controller';
import { multerConfig } from './multer.config';

/**
 * Provide STORAGE_SERVICE as either MinioStorageService (when MINIO_ENDPOINT
 * is set in the environment) or LocalStorageService (local development).
 *
 * NOTE: useFactory (not useClass) is intentional — process.env is not yet
 * populated with .env values at module-load time, so we must resolve this
 * lazily via ConfigService which is available after ConfigModule runs.
 */
const storageServiceProvider = {
  provide: STORAGE_SERVICE,
  useFactory: (
    config: ConfigService,
    local: LocalStorageService,
    minio: MinioStorageService,
  ) => {
    const endpoint = config.get<string>('MINIO_ENDPOINT');
    return endpoint ? minio : local;
  },
  inject: [ConfigService, LocalStorageService, MinioStorageService],
};

@Module({
  imports: [ConfigModule, MulterModule.register(multerConfig)],
  controllers: [UploadController],
  providers: [
    ImageProcessorService,
    LocalStorageService,   // kept so existing code that injects it directly still compiles
    MinioStorageService,   // always provided; only activated via token in prod
    storageServiceProvider,
  ],
  exports: [
    ImageProcessorService,
    LocalStorageService,
    STORAGE_SERVICE,
    MulterModule,
  ],
})
export class UploadModule {}
