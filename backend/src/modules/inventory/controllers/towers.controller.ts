import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TowersService } from '../services/towers.service';
import { CreateTowerDto } from '../dto/create-tower.dto';
import { UpdateTowerDto } from '../dto/update-tower.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@Controller('towers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TowersController {
  constructor(private readonly towersService: TowersService) {}

  @Post()
  @Roles('super_admin', 'admin')
  create(@Body() createTowerDto: CreateTowerDto, @Request() req) {
    return this.towersService.create(createTowerDto, req.user.id);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.towersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.towersService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin')
  update(
    @Param('id') id: string,
    @Body() updateTowerDto: UpdateTowerDto,
    @Request() req,
  ) {
    return this.towersService.update(id, updateTowerDto, req.user.id);
  }

  @Delete(':id')
  @Roles('super_admin', 'admin')
  remove(@Param('id') id: string) {
    return this.towersService.remove(id);
  }
}