import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlatProgressService } from '../flat-progress.service';
import { CreateFlatProgressDto } from '../dto/create-flat-progress.dto';
import { Flat } from '../../flats/entities/flat.entity';
import { ConstructionProject } from '../entities/construction-project.entity';
import { ConstructionFlatProgress } from '../entities/construction-flat-progress.entity';
import { ConstructionWorkflowService } from '../services/construction-workflow.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

interface SimpleFlatProgressDto {
  flatId: string;
  phase: string;
  phaseProgress?: number;
  overallProgress?: number;
  status?: string;
  notes?: string;
  photos?: string[];
}

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

@Controller('construction/flat-progress')
export class FlatProgressSimpleController {
  constructor(
    private readonly flatProgressService: FlatProgressService,
    private readonly workflowService: ConstructionWorkflowService,
    @InjectRepository(Flat)
    private flatRepository: Repository<Flat>,
    @InjectRepository(ConstructionProject)
    private constructionProjectRepository: Repository<ConstructionProject>,
    @InjectRepository(ConstructionFlatProgress)
    private flatProgressRepo: Repository<ConstructionFlatProgress>,
  ) {}

  // Get all progress records for a flat
  @Get('flat/:flatId')
  async getFlatProgress(@Param('flatId') flatId: string) {
    return this.flatProgressService.findByFlat(flatId);
  }

  // Recent progress rows across the whole ERP, for activity feeds.
  // Optional `propertyId` narrows the feed to a single property.
  @Get('recent')
  async getRecent(
    @Query('limit') limit?: string,
    @Query('propertyId') propertyId?: string,
  ) {
    const max = Math.min(50, Math.max(1, Number(limit) || 10));
    const qb = this.flatProgressRepo
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.flat', 'flat')
      .leftJoinAndSelect('flat.tower', 'tower')
      .leftJoinAndSelect('flat.property', 'property')
      .orderBy('progress.updatedAt', 'DESC')
      .limit(max);
    if (propertyId) {
      qb.andWhere('flat.propertyId = :propertyId', { propertyId });
    }
    return qb.getMany();
  }

  /**
   * POST /construction/flat-progress/upload/photos
   * Stateless photo upload: accepts up to 5 files, returns absolute URLs.
   * The frontend then passes these URLs back in the photos[] field of the
   * progress payload. This avoids the chicken-and-egg of "create log → upload".
   */
  @Post('upload/photos')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('photos', 5, {
      storage: photoStorage,
      limits: { fileSize: MAX_SIZE_BYTES },
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
  uploadPhotos(@UploadedFiles() files: Express.Multer.File[] = []) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    const urls = files.map((f) => `/uploads/progress-photos/${f.filename}`);
    return { urls };
  }

  // Create or update flat progress record (simplified - auto-finds or creates constructionProject)
  @Post()
  async createFlatProgress(@Body() dto: SimpleFlatProgressDto) {
    // Find the flat to get its property
    const flat = await this.flatRepository.findOne({
      where: { id: dto.flatId },
      relations: ['property'],
    });

    if (!flat) {
      throw new NotFoundException(`Flat with ID ${dto.flatId} not found`);
    }

    if (!flat.propertyId) {
      throw new BadRequestException('Flat must be associated with a property');
    }

    // Try to find an existing construction project for this property
    let constructionProject = await this.constructionProjectRepository.findOne({
      where: { propertyId: flat.propertyId },
      order: { createdAt: 'DESC' },
    });

    // If no project exists, create a default one so the flat-progress row has a parent.
    if (!constructionProject) {
      const today = new Date();
      const oneYearLater = new Date();
      oneYearLater.setFullYear(today.getFullYear() + 1);

      constructionProject = this.constructionProjectRepository.create({
        projectName: `${flat.property?.name || 'Property'} - Construction`,
        propertyId: flat.propertyId,
        status: 'IN_PROGRESS',
        startDate: today,
        expectedCompletionDate: oneYearLater,
        overallProgress: 0,
        budgetAllocated: 0,
        budgetSpent: 0,
      });
      constructionProject = await this.constructionProjectRepository.save(constructionProject);
    }

    // Check if a progress record already exists for this flat and phase
    const existingProgress = await this.flatProgressService.findByFlatAndPhase(
      dto.flatId,
      dto.phase as any,
    );

    const incomingPhotos = Array.isArray(dto.photos) ? dto.photos.filter(Boolean) : undefined;

    let savedProgress;

    if (existingProgress && !Array.isArray(existingProgress)) {
      // Merge photos so a later log doesn't wipe earlier ones.
      const mergedPhotos = incomingPhotos
        ? [...(existingProgress.photos || []), ...incomingPhotos]
        : existingProgress.photos;

      savedProgress = await this.flatProgressService.update(existingProgress.id, {
        phaseProgress: dto.phaseProgress,
        overallProgress: dto.overallProgress,
        status: dto.status as any,
        notes: dto.notes,
        photos: mergedPhotos,
      } as any);
    } else {
      const createDto: CreateFlatProgressDto & { photos?: string[] | null } = {
        ...dto,
        constructionProjectId: constructionProject.id,
        photos: incomingPhotos ?? null,
      } as any;

      savedProgress = await this.flatProgressService.create(createDto as CreateFlatProgressDto);
    }

    // Trigger automated workflow: update flat, check milestones, generate demand drafts
    let workflow = { milestonesTriggered: 0, generatedDemandDrafts: [] as any[] };
    try {
      workflow = await this.workflowService.processConstructionUpdate(
        dto.flatId,
        dto.phase,
        dto.phaseProgress || 0,
        dto.overallProgress || 0,
      );
    } catch (error) {
      // Log but don't fail the request - progress was saved successfully
      console.error('Error in automated workflow:', error);
    }

    return {
      ...(savedProgress as any),
      workflow,
    };
  }
}
