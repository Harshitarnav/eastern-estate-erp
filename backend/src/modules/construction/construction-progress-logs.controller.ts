import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseInterceptors, UploadedFiles, BadRequestException, UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { ConstructionProgressLogsService } from './construction-progress-logs.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB per file

const photoStorage = diskStorage({
  destination: (_req, _file, cb) => {
    const dir = join(process.cwd(), 'uploads', 'progress-photos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

@Controller('construction-progress-logs')
@UseGuards(JwtAuthGuard)
export class ConstructionProgressLogsController {
  constructor(private readonly constructionProgressLogsService: ConstructionProgressLogsService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.constructionProgressLogsService.create(createDto);
  }

  @Get()
  findAll(
    @Query('constructionProjectId') constructionProjectId?: string,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.constructionProgressLogsService.findAll({ constructionProjectId, propertyId });
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.constructionProgressLogsService.findByProject(projectId);
  }

  @Get('project/:projectId/latest')
  getLatestByProject(@Param('projectId') projectId: string) {
    return this.constructionProgressLogsService.getLatestByProject(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.constructionProgressLogsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.constructionProgressLogsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.constructionProgressLogsService.remove(id);
  }

  /**
   * POST /construction-progress-logs/:id/photos
   * Upload up to 5 site photos for a progress log.
   * Returns updated log with photo URLs.
   */
  @Post(':id/photos')
  @UseInterceptors(
    FilesInterceptor('photos', 5, {
      storage: photoStorage,
      limits: { fileSize: MAX_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME.includes(file.mimetype)) {
          return cb(new BadRequestException(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, GIF`), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadPhotos(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    const urls = files.map(f => `/uploads/progress-photos/${f.filename}`);
    return this.constructionProgressLogsService.addPhotos(id, urls);
  }

  /**
   * DELETE /construction-progress-logs/:id/photos
   * Body: { photoUrl: string }
   * Removes one photo URL from the log's photos array and deletes the file on disk.
   */
  @Delete(':id/photos')
  removePhoto(
    @Param('id') id: string,
    @Body('photoUrl') photoUrl: string,
  ) {
    if (!photoUrl) throw new BadRequestException('photoUrl is required');

    // Delete physical file (best-effort - don't fail if already gone)
    try {
      const filePath = join(process.cwd(), 'uploads', photoUrl.replace(/^\/uploads\//, ''));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch { /* ignore */ }

    return this.constructionProgressLogsService.removePhoto(id, photoUrl);
  }
}
