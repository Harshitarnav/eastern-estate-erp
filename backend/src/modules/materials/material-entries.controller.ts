import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { MaterialEntriesService } from './material-entries.service';
import { CreateMaterialEntryDto } from './dto/create-material-entry.dto';
import { UpdateMaterialEntryDto } from './dto/update-material-entry.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('material-entries')
@UseGuards(JwtAuthGuard)
export class MaterialEntriesController {
  constructor(private readonly entriesService: MaterialEntriesService) {}

  @Post()
  create(@Body() createDto: CreateMaterialEntryDto) {
    return this.entriesService.create(createDto);
  }

  @Get()
  findAll(
    @Query('materialId') materialId?: string,
    @Query('vendorId') vendorId?: string,
  ) {
    const filters: any = {};
    if (materialId) filters.materialId = materialId;
    if (vendorId) filters.vendorId = vendorId;
    
    return this.entriesService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateMaterialEntryDto) {
    return this.entriesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.entriesService.remove(id);
  }
}
