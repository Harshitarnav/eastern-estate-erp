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
  Request,
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
  async create(@Body() createBookingDto: CreateBookingDto, @Request() req: any): Promise<BookingResponseDto> {
    return this.bookingsService.create(createBookingDto, req.user?.userId ?? req.user?.id);
  }

  @Get()
  async findAll(@Query() query: QueryBookingDto, @Request() req: any): Promise<PaginatedBookingsResponse> {
    return this.bookingsService.findAll(query, req.accessiblePropertyIds);
  }

  @Get('statistics')
  async getStatistics(
    @Query('propertyId') propertyId: string | undefined,
    @Request() req: any,
  ) {
    return this.bookingsService.getStatistics(
      req.accessiblePropertyIds,
      propertyId,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any): Promise<BookingResponseDto> {
    return this.bookingsService.findOne(id, req?.accessiblePropertyIds);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Request() req: any,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.update(id, updateBookingDto, req?.accessiblePropertyIds);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.bookingsService.remove(id, req?.accessiblePropertyIds);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id') id: string,
    @Body() body: { reason: string; refundAmount?: number },
    @Request() req: any,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.cancelBooking(id, body.reason, body.refundAmount, req?.accessiblePropertyIds);
  }
}
