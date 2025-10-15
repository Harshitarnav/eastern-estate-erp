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
import { FlatsService } from '../services/flats.service';
import { CreateFlatDto } from '../dto/create-flat.dto';
import { UpdateFlatDto } from '../dto/update-flat.dto';
import { UpdateFlatStatusDto } from '../dto/update-flat-status.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@Controller('flats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FlatsController {
  constructor(private readonly flatsService: FlatsService) {}

  @Post()
  @Roles('super_admin', 'admin', 'accountant')
  create(@Body() createFlatDto: CreateFlatDto, @Request() req) {
    return this.flatsService.create(createFlatDto, req.user.id);
  }

  @Post('bulk')
  @Roles('super_admin', 'admin', 'accountant')
  createBulk(@Body() body: { flats: CreateFlatDto[] }, @Request() req) {
    return this.flatsService.createBulk(body.flats, req.user.id);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.flatsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flatsService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin', 'accountant')
  update(
    @Param('id') id: string,
    @Body() updateFlatDto: UpdateFlatDto,
    @Request() req,
  ) {
    return this.flatsService.update(id, updateFlatDto, req.user.id);
  }

  @Patch(':id/status')
  @Roles('super_admin', 'admin', 'accountant', 'sales_manager')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateFlatStatusDto,
    @Request() req,
  ) {
    return this.flatsService.updateStatus(id, updateStatusDto.status, req.user.id);
  }

  @Patch('bulk/status')
  @Roles('super_admin', 'admin', 'accountant')
  updateBulkStatus(
    @Body() body: { ids: string[]; status: string },
    @Request() req,
  ) {
    return this.flatsService.updateBulkStatus(body.ids, body.status, req.user.id);
  }

  @Delete(':id')
  @Roles('super_admin', 'admin')
  remove(@Param('id') id: string) {
    return this.flatsService.remove(id);
  }
}