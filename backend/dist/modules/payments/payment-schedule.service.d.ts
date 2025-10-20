import { Repository } from 'typeorm';
import { PaymentSchedule } from './entities/payment-schedule.entity';
export type PaymentPlan = 'CONSTRUCTION_LINKED' | 'TIME_LINKED' | 'DOWN_PAYMENT';
export declare class PaymentScheduleService {
    private scheduleRepository;
    private readonly logger;
    constructor(scheduleRepository: Repository<PaymentSchedule>);
    generateScheduleForBooking(bookingId: string, bookingNumber: string, totalAmount: number, tokenAmount: number, paymentPlan?: PaymentPlan, startDate?: Date): Promise<PaymentSchedule[]>;
    private generateConstructionLinkedSchedule;
    private generateTimeLinkedSchedule;
    private generateDownPaymentSchedule;
    getScheduleForBooking(bookingId: string): Promise<PaymentSchedule[]>;
    markInstallmentAsPaid(scheduleId: string, paymentId: string, amount: number): Promise<PaymentSchedule>;
    updateOverdueSchedules(): Promise<number>;
}
