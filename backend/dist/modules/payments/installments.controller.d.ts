import { InstallmentsService } from './installments.service';
import { CreateInstallmentDto, CreateInstallmentScheduleDto } from './dto/create-installment.dto';
import { InstallmentStatus } from './entities/payment-installment.entity';
export declare class InstallmentsController {
    private readonly installmentsService;
    constructor(installmentsService: InstallmentsService);
    create(createInstallmentDto: CreateInstallmentDto): any;
    createSchedule(scheduleDto: CreateInstallmentScheduleDto): any;
    findAll(bookingId?: string, status?: InstallmentStatus, overdue?: string): any;
    getOverdue(): any;
    getUpcoming(days?: string): any;
    findByBooking(bookingId: string): any;
    getBookingStats(bookingId: string): any;
    findOne(id: string): any;
    update(id: string, updateData: any): any;
    markAsPaid(id: string, body: {
        paymentId: string;
        paidAmount?: number;
    }): any;
    waive(id: string): any;
    updateLateFees(body: {
        lateFeePerDay?: number;
    }): any;
    remove(id: string): any;
}
