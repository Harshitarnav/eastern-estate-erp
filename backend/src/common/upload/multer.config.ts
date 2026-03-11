import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';

/**
 * Files are written to the OS temp directory first.
 * The active StorageService (LocalStorageService or MinioStorageService)
 * then moves/uploads the file from there to its final destination when
 * storage.save(file, key) is called.
 */
export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, tmpdir());
    },
    filename: (_req, file, cb) => {
      const uniqueId = uuidv4();
      const ext = extname(file.originalname);
      cb(null, `${uniqueId}${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // Text
      'text/plain',
      'text/csv',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException(`File type ${file.mimetype} is not allowed`), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
};

export const imageUploadConfig: MulterOptions = {
  ...multerConfig,
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
};
