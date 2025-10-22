import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { MaterialExitsService } from './material-exits.service';
import { CreateMaterialExitDto } from './dto/create-material-exit.dto';
import { UpdateMaterialExitDto } from './dto/update-material-exit.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('material-exits')
@UseGuards(JwtAuthGuard)
export class MaterialExitsController {
  constructor(private readonly exitsService: MaterialExitsService) {}

  @Post()
  create(@Body() createDto: CreateMaterialExitDto) {
    return this.exitsService.create(createDto);
  }

  @Get()
  findAll(
    @Query('materialId') materialId?: string,
    @Query('projectId') projectId?: string,
  ) {
    const filters: any = {};
    if (materialId) filters.materialId = materialId;
    if (projectId) filters.projectId = projectId;
    
    return this.exitsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exitsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateMaterialExitDto) {
    return this.exitsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exitsService.remove(id);
  }
}
