// upload.controller.ts - File Upload Controller for Eastern Estate ERP
// Save as: backend/src/common/upload/upload.controller.ts

import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  BadRequestException,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname, join } from 'path';
import { Response } from 'express';
import { existsSync } from 'fs';

// File type validators
const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new BadRequestException('Only image files are allowed'), false);
  }
  cb(null, true);
};

const documentFileFilter = (req, file, cb) => {
  const allowedExt = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
  const ext = extname(file.originalname).toLowerCase();
  if (!allowedExt.includes(ext)) {
    return cb(new BadRequestException('Only PDF, DOC, DOCX, XLS, XLSX files are allowed'), false);
  }
  cb(null, true);
};

// Storage configuration
const getStorage = (destination: string) => {
  return diskStorage({
    destination: `./uploads/${destination}`,
    filename: (req, file, cb) => {
      const uniqueName = `${uuid()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
};

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  
  // ============================================
  // Property Images Upload
  // ============================================
  @Post('property-images')
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      storage: getStorage('properties'),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadPropertyImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const urls = files.map(
      (file) => `${process.env.APP_URL}/api/v1/uploads/properties/${file.filename}`,
    );

    return {
      success: true,
      urls,
      count: files.length,
    };
  }

  // ============================================
  // Property Documents Upload (Brochures, Plans)
  // ============================================
  @Post('property-documents')
  @UseInterceptors(
    FilesInterceptor('documents', 10, {
      storage: getStorage('documents'),
      fileFilter: documentFileFilter,
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
      },
    }),
  )
  async uploadPropertyDocuments(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const urls = files.map(
      (file) => `${process.env.APP_URL}/api/v1/uploads/documents/${file.filename}`,
    );

    return {
      success: true,
      urls,
      count: files.length,
    };
  }

  // ============================================
  // Customer KYC Documents Upload
  // ============================================
  @Post('kyc-documents')
  @UseInterceptors(
    FilesInterceptor('kyc', 5, {
      storage: getStorage('kyc'),
      fileFilter: (req, file, cb) => {
        const allowed = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
        if (!allowed) {
          return cb(new BadRequestException('Only images and PDF files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadKYCDocuments(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const urls = files.map(
      (file) => `${process.env.APP_URL}/api/v1/uploads/kyc/${file.filename}`,
    );

    return {
      success: true,
      urls,
      count: files.length,
    };
  }

  // ============================================
  // Payment Receipt Upload
  // ============================================
  @Post('payment-receipt')
  @UseInterceptors(
    FileInterceptor('receipt', {
      storage: getStorage('receipts'),
      fileFilter: (req, file, cb) => {
        const allowed = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
        if (!allowed) {
          return cb(new BadRequestException('Only images and PDF files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadPaymentReceipt(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const url = `${process.env.APP_URL}/api/v1/uploads/receipts/${file.filename}`;

    return {
      success: true,
      url,
      filename: file.originalname,
    };
  }

  // ============================================
  // Profile Picture Upload
  // ============================================
  @Post('profile-picture')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: getStorage('avatars'),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  async uploadProfilePicture(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const url = `${process.env.APP_URL}/api/v1/uploads/avatars/${file.filename}`;

    return {
      success: true,
      url,
    };
  }

  // ============================================
  // Serve Uploaded Files
  // ============================================
  @Get(':folder/:filename')
  async serveFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const allowedFolders = ['properties', 'documents', 'kyc', 'receipts', 'avatars'];
    
    if (!allowedFolders.includes(folder)) {
      throw new BadRequestException('Invalid folder');
    }

    const filePath = join(process.cwd(), 'uploads', folder, filename);

    if (!existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }

    return res.sendFile(filePath);
  }
}