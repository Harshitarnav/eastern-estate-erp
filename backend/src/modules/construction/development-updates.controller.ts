import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { DevelopmentUpdatesService } from './development-updates.service';
import { CreateDevelopmentUpdateDto } from './dto/create-development-update.dto';
import { UpdateDevelopmentUpdateDto } from './dto/update-development-update.dto';

@Controller('construction-projects')
export class DevelopmentUpdatesController {
  constructor(
    private readonly developmentUpdatesService: DevelopmentUpdatesService,
  ) {}

  // Create a new development update
  @Post(':id/development-updates')
  async createUpdate(
    @Param('id') projectId: string,
    @Body() createDto: CreateDevelopmentUpdateDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.developmentUpdatesService.create(
      { ...createDto, constructionProjectId: projectId },
      userId,
    );
  }

  // Get all development updates for a project
  @Get(':id/development-updates')
  async getProjectUpdates(@Param('id') projectId: string) {
    return this.developmentUpdatesService.findByProject(projectId);
  }

  // Get specific development update
  @Get('development-updates/:id')
  async getUpdate(@Param('id') updateId: string) {
    return this.developmentUpdatesService.findOne(updateId);
  }

  // Update a development update
  @Put('development-updates/:id')
  async updateUpdate(
    @Param('id') updateId: string,
    @Body() updateDto: UpdateDevelopmentUpdateDto,
  ) {
    return this.developmentUpdatesService.update(updateId, updateDto);
  }

  // Delete a development update
  @Delete('development-updates/:id')
  async deleteUpdate(@Param('id') updateId: string) {
    return this.developmentUpdatesService.remove(updateId);
  }

  // Add images to an update
  @Post('development-updates/:id/images')
  async addImages(
    @Param('id') updateId: string,
    @Body('images') images: string[],
  ) {
    return this.developmentUpdatesService.addImages(updateId, images);
  }

  // Remove an image from an update
  @Delete('development-updates/:id/images')
  async removeImage(
    @Param('id') updateId: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    return this.developmentUpdatesService.removeImage(updateId, imageUrl);
  }

  // Add attachments to an update
  @Post('development-updates/:id/attachments')
  async addAttachments(
    @Param('id') updateId: string,
    @Body('attachments') attachments: string[],
  ) {
    return this.developmentUpdatesService.addAttachments(
      updateId,
      attachments,
    );
  }

  // Get recent updates (last N days)
  @Get(':id/development-updates/recent')
  async getRecentUpdates(
    @Param('id') projectId: string,
    @Query('days') days?: number,
  ) {
    return this.developmentUpdatesService.getRecentUpdates(
      projectId,
      days ? parseInt(days.toString()) : 7,
    );
  }

  // Get updates with images
  @Get(':id/development-updates/with-images')
  async getUpdatesWithImages(@Param('id') projectId: string) {
    return this.developmentUpdatesService.getUpdatesWithImages(projectId);
  }

  // Get updates by visibility
  @Get(':id/development-updates/visibility/:visibility')
  async getUpdatesByVisibility(
    @Param('id') projectId: string,
    @Param('visibility') visibility: string,
  ) {
    return this.developmentUpdatesService.getUpdatesByVisibility(
      projectId,
      visibility,
    );
  }

  // Get updates timeline (grouped by month)
  @Get(':id/development-updates/timeline')
  async getUpdatesTimeline(@Param('id') projectId: string) {
    return this.developmentUpdatesService.getUpdatesTimeline(projectId);
  }

  // Get update statistics for a project
  @Get(':id/development-updates/statistics')
  async getUpdateStatistics(@Param('id') projectId: string) {
    return this.developmentUpdatesService.getProjectUpdateStatistics(
      projectId,
    );
  }
}
