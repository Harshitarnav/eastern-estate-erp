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
  async findAll(@Query() query: QueryCustomerDto): Promise<PaginatedCustomersResponse> {
    return this.customersService.findAll(query);
  }

  @Get('statistics')
  async getStatistics() {
    return this.customersService.getStatistics();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CustomerResponseDto> {
    return this.customersService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.customersService.remove(id);
  }
}
