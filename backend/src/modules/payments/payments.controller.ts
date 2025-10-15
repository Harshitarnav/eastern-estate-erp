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
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  QueryPaymentDto,
  PaymentResponseDto,
  PaginatedPaymentsResponse,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  async findAll(@Query() query: QueryPaymentDto): Promise<PaginatedPaymentsResponse> {
    return this.paymentsService.findAll(query);
  }

  @Get('statistics')
  async getStatistics() {
    return this.paymentsService.getStatistics();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.paymentsService.remove(id);
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  async verify(
    @Param('id') id: string,
    @Body() body: { verifiedBy: string },
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.verifyPayment(id, body.verifiedBy);
  }
}
