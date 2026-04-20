import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DevelopmentUpdatesService } from './development-updates.service';
import { CreateDevelopmentUpdateDto } from './dto/create-development-update.dto';
import {
  DevelopmentUpdateCategory,
  DevelopmentUpdateScope,
} from './entities/construction-development-update.entity';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024;

const photoStorage = diskStorage({
  destination: (_req, _file, cb) => {
    const dir = join(process.cwd(), 'uploads', 'development-photos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

/**
 * Top-level controller for "development updates" that are not tied to a
 * construction project - property-wide, tower-wide, or common-area updates
 * (lifts, landscaping, facade paint, clubhouse, etc).
 *
 * These updates intentionally do NOT raise demand drafts - DD generation stays
 * rooted in per-flat construction phase progress.
 */
@Controller('development-updates')
@UseGuards(JwtAuthGuard)
export class ScopedDevelopmentUpdatesController {
  constructor(private readonly service: DevelopmentUpdatesService) {}

  @Get()
  async list(
    @Req() req: any,
    @Query('propertyId') propertyId?: string,
    @Query('towerId') towerId?: string,
    @Query('scopeType') scopeType?: DevelopmentUpdateScope,
    @Query('category') category?: DevelopmentUpdateCategory,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const accessiblePropertyIds: string[] | null =
      req.user?.accessiblePropertyIds ?? null;
    return this.service.findScoped(
      {
        propertyId,
        towerId,
        scopeType,
        category,
        limit: limit ? Math.min(parseInt(limit, 10), 200) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      },
      accessiblePropertyIds,
    );
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Req() req: any) {
    const accessiblePropertyIds: string[] | null =
      req.user?.accessiblePropertyIds ?? null;
    return this.service.findOneScoped(id, accessiblePropertyIds);
  }

  @Post()
  async create(@Body() dto: CreateDevelopmentUpdateDto, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    return this.service.create(dto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const accessiblePropertyIds: string[] | null =
      req.user?.accessiblePropertyIds ?? null;
    return this.service.remove(id, accessiblePropertyIds);
  }

  @Post('upload/images')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: photoStorage,
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              `Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, GIF`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadImages(@UploadedFiles() files: Express.Multer.File[] = []) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    return {
      urls: files.map((f) => `/uploads/development-photos/${f.filename}`),
    };
  }
}
