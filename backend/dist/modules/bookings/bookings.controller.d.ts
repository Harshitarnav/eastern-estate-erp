import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto, QueryBookingDto, BookingResponseDto, PaginatedBookingsResponse } from './dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(createBookingDto: CreateBookingDto): Promise<BookingResponseDto>;
    findAll(query: QueryBookingDto): Promise<PaginatedBookingsResponse>;
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
    findOne(id: string): Promise<BookingResponseDto>;
    update(id: string, updateBookingDto: UpdateBookingDto): Promise<BookingResponseDto>;
    remove(id: string): Promise<void>;
    cancel(id: string, body: {
        reason: string;
        refundAmount?: number;
    }): Promise<BookingResponseDto>;
}
