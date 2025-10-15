import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import {
  CreateBookingDto,
  UpdateBookingDto,
  QueryBookingDto,
  BookingResponseDto,
  PaginatedBookingsResponse,
} from './dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<BookingResponseDto> {
    // Check for duplicate booking number
    const existing = await this.bookingsRepository.findOne({
      where: { bookingNumber: createBookingDto.bookingNumber },
    });

    if (existing) {
      throw new ConflictException('Booking number already exists');
    }

    // Calculate balance amount
    const balanceAmount = createBookingDto.totalAmount - (createBookingDto.paidAmount || 0);

    const booking = this.bookingsRepository.create({
      ...createBookingDto,
      balanceAmount,
    });

    const savedBooking = await this.bookingsRepository.save(booking);

    return BookingResponseDto.fromEntity(savedBooking);
  }

  async findAll(query: QueryBookingDto): Promise<PaginatedBookingsResponse> {
    const {
      search,
      status,
      paymentStatus,
      customerId,
      flatId,
      propertyId,
      bookingDateFrom,
      bookingDateTo,
      isHomeLoan,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.flat', 'flat')
      .leftJoinAndSelect('booking.property', 'property');

    if (search) {
      queryBuilder.andWhere(
        '(booking.bookingNumber ILIKE :search OR booking.agreementNumber ILIKE :search OR customer.firstName ILIKE :search OR customer.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('booking.paymentStatus = :paymentStatus', { paymentStatus });
    }

    if (customerId) {
      queryBuilder.andWhere('booking.customerId = :customerId', { customerId });
    }

    if (flatId) {
      queryBuilder.andWhere('booking.flatId = :flatId', { flatId });
    }

    if (propertyId) {
      queryBuilder.andWhere('booking.propertyId = :propertyId', { propertyId });
    }

    if (bookingDateFrom) {
      queryBuilder.andWhere('booking.bookingDate >= :bookingDateFrom', { bookingDateFrom });
    }

    if (bookingDateTo) {
      queryBuilder.andWhere('booking.bookingDate <= :bookingDateTo', { bookingDateTo });
    }

    if (isHomeLoan !== undefined) {
      queryBuilder.andWhere('booking.isHomeLoan = :isHomeLoan', { isHomeLoan });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('booking.isActive = :isActive', { isActive });
    }

    queryBuilder.orderBy(`booking.${sortBy}`, sortOrder);

    const total = await queryBuilder.getCount();
    const bookings = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: BookingResponseDto.fromEntities(bookings),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<BookingResponseDto> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['customer', 'flat', 'property'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return BookingResponseDto.fromEntity(booking);
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<BookingResponseDto> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Check for duplicate booking number if being updated
    if (updateBookingDto.bookingNumber && updateBookingDto.bookingNumber !== booking.bookingNumber) {
      const existing = await this.bookingsRepository.findOne({
        where: { bookingNumber: updateBookingDto.bookingNumber },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Booking number already exists');
      }
    }

    // Recalculate balance if amounts change
    const totalAmount = updateBookingDto.totalAmount ?? booking.totalAmount;
    const paidAmount = updateBookingDto.paidAmount ?? booking.paidAmount;
    const balanceAmount = Number(totalAmount) - Number(paidAmount);

    Object.assign(booking, {
      ...updateBookingDto,
      balanceAmount,
    });

    const updatedBooking = await this.bookingsRepository.save(booking);

    return BookingResponseDto.fromEntity(updatedBooking);
  }

  async remove(id: string): Promise<void> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    booking.isActive = false;
    await this.bookingsRepository.save(booking);
  }

  async cancelBooking(id: string, reason: string, refundAmount?: number): Promise<BookingResponseDto> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationDate = new Date();
    booking.cancellationReason = reason;
    booking.refundAmount = refundAmount;

    const cancelledBooking = await this.bookingsRepository.save(booking);

    return BookingResponseDto.fromEntity(cancelledBooking);
  }

  async getStatistics() {
    const bookings = await this.bookingsRepository.find({ where: { isActive: true } });

    const total = bookings.length;
    const tokenPaid = bookings.filter((b) => b.status === 'TOKEN_PAID').length;
    const agreementPending = bookings.filter((b) => b.status === 'AGREEMENT_PENDING').length;
    const agreementSigned = bookings.filter((b) => b.status === 'AGREEMENT_SIGNED').length;
    const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length;
    const completed = bookings.filter((b) => b.status === 'COMPLETED').length;
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length;

    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const totalPaid = bookings.reduce((sum, b) => sum + Number(b.paidAmount), 0);
    const totalBalance = bookings.reduce((sum, b) => sum + Number(b.balanceAmount), 0);

    const withHomeLoan = bookings.filter((b) => b.isHomeLoan).length;
    const totalLoanAmount = bookings
      .filter((b) => b.isHomeLoan && b.loanAmount)
      .reduce((sum, b) => sum + Number(b.loanAmount), 0);

    return {
      total,
      tokenPaid,
      agreementPending,
      agreementSigned,
      confirmed,
      completed,
      cancelled,
      totalRevenue,
      totalPaid,
      totalBalance,
      withHomeLoan,
      totalLoanAmount,
      collectionRate: totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0,
    };
  }
}
