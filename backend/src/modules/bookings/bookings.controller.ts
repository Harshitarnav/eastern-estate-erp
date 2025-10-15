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
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  QueryBookingDto,
  BookingResponseDto,
  PaginatedBookingsResponse,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBookingDto: CreateBookingDto): Promise<BookingResponseDto> {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  async findAll(@Query() query: QueryBookingDto): Promise<PaginatedBookingsResponse> {
    return this.bookingsService.findAll(query);
  }

  @Get('statistics')
  async getStatistics() {
    return this.bookingsService.getStatistics();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BookingResponseDto> {
    return this.bookingsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.bookingsService.remove(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id') id: string,
    @Body() body: { reason: string; refundAmount?: number },
  ): Promise<BookingResponseDto> {
    return this.bookingsService.cancelBooking(id, body.reason, body.refundAmount);
  }
}
