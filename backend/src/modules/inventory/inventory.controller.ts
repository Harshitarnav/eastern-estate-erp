import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  QueryInventoryItemDto,
  InventoryItemResponseDto,
  PaginatedInventoryItemsResponse,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateInventoryItemDto): Promise<InventoryItemResponseDto> {
    return this.inventoryService.create(createDto);
  }

  @Get()
  async findAll(@Query() query: QueryInventoryItemDto): Promise<PaginatedInventoryItemsResponse> {
    return this.inventoryService.findAll(query);
  }

  @Get('statistics')
  async getStatistics() {
    return this.inventoryService.getStatistics();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<InventoryItemResponseDto> {
    return this.inventoryService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInventoryItemDto,
  ): Promise<InventoryItemResponseDto> {
    return this.inventoryService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.inventoryService.remove(id);
  }

  @Post(':id/issue')
  @HttpCode(HttpStatus.OK)
  async issue(
    @Param('id') id: string,
    @Body() body: { quantity: number },
  ): Promise<InventoryItemResponseDto> {
    return this.inventoryService.issueItem(id, body.quantity);
  }

  @Post(':id/receive')
  @HttpCode(HttpStatus.OK)
  async receive(
    @Param('id') id: string,
    @Body() body: { quantity: number },
  ): Promise<InventoryItemResponseDto> {
    return this.inventoryService.receiveItem(id, body.quantity);
  }
}
