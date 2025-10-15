import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto, UpdateBookingDto, QueryBookingDto, BookingResponseDto, PaginatedBookingsResponse } from './dto';
export declare class BookingsService {
    private bookingsRepository;
    constructor(bookingsRepository: Repository<Booking>);
    create(createBookingDto: CreateBookingDto): Promise<BookingResponseDto>;
    findAll(query: QueryBookingDto): Promise<PaginatedBookingsResponse>;
    findOne(id: string): Promise<BookingResponseDto>;
    update(id: string, updateBookingDto: UpdateBookingDto): Promise<BookingResponseDto>;
    remove(id: string): Promise<void>;
    cancelBooking(id: string, reason: string, refundAmount?: number): Promise<BookingResponseDto>;
    getStatistics(): Promise<{
        total: number;
        tokenPaid: number;
        agreementPending: number;
        agreementSigned: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        totalRevenue: number;
        totalPaid: number;
        totalBalance: number;
        withHomeLoan: number;
        totalLoanAmount: number;
        collectionRate: number;
    }>;
}
