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
import { PurchaseOrdersService } from './purchase-orders.service';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  QueryPurchaseOrderDto,
  PurchaseOrderResponseDto,
  PaginatedPurchaseOrdersResponse,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard)
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreatePurchaseOrderDto): Promise<PurchaseOrderResponseDto> {
    return this.purchaseOrdersService.create(createDto);
  }

  @Get()
  async findAll(@Query() query: QueryPurchaseOrderDto): Promise<PaginatedPurchaseOrdersResponse> {
    return this.purchaseOrdersService.findAll(query);
  }

  @Get('statistics')
  async getStatistics() {
    return this.purchaseOrdersService.getStatistics();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PurchaseOrderResponseDto> {
    return this.purchaseOrdersService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePurchaseOrderDto,
  ): Promise<PurchaseOrderResponseDto> {
    return this.purchaseOrdersService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.purchaseOrdersService.remove(id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id') id: string,
    @Body() body: { approvedBy: string; approvedByName: string },
  ): Promise<PurchaseOrderResponseDto> {
    return this.purchaseOrdersService.approve(id, body.approvedBy, body.approvedByName);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id') id: string,
    @Body() body: { rejectedBy: string; rejectedByName: string; reason: string },
  ): Promise<PurchaseOrderResponseDto> {
    return this.purchaseOrdersService.reject(id, body.rejectedBy, body.rejectedByName, body.reason);
  }

  @Post(':id/receive')
  @HttpCode(HttpStatus.OK)
  async receiveItems(
    @Param('id') id: string,
    @Body() receivedData: any,
  ): Promise<PurchaseOrderResponseDto> {
    return this.purchaseOrdersService.receiveItems(id, receivedData);
  }
}
