import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  QueryCustomerDto,
  CustomerResponseDto,
  PaginatedCustomersResponse,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  async findAll(@Query() query: QueryCustomerDto, @Req() req: any): Promise<PaginatedCustomersResponse> {
    return this.customersService.findAll(query, req.accessiblePropertyIds);
  }

  @Get('statistics')
  async getStatistics(
    @Query('propertyId') propertyId: string | undefined,
    @Req() req: any,
  ) {
    return this.customersService.getStatistics(
      propertyId,
      req?.accessiblePropertyIds,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any): Promise<CustomerResponseDto> {
    return this.customersService.findOne(id, req?.accessiblePropertyIds);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Req() req: any,
  ): Promise<CustomerResponseDto> {
    return this.customersService.update(id, updateCustomerDto, req?.accessiblePropertyIds);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
    return this.customersService.remove(id, req?.accessiblePropertyIds);
  }
}
