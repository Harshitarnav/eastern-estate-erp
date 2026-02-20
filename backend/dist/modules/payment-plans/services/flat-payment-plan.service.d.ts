import { Repository } from 'typeorm';
import { FlatPaymentPlan, FlatPaymentMilestone } from '../entities/flat-payment-plan.entity';
import { CreateFlatPaymentPlanDto } from '../dto/create-flat-payment-plan.dto';
import { PaymentPlanTemplateService } from './payment-plan-template.service';
import { Flat } from '../../flats/entities/flat.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Customer } from '../../customers/entities/customer.entity';
export declare class FlatPaymentPlanService {
    private readonly flatPaymentPlanRepository;
    private readonly flatRepository;
    private readonly bookingRepository;
    private readonly customerRepository;
    private readonly templateService;
    constructor(flatPaymentPlanRepository: Repository<FlatPaymentPlan>, flatRepository: Repository<Flat>, bookingRepository: Repository<Booking>, customerRepository: Repository<Customer>, templateService: PaymentPlanTemplateService);
    create(createDto: CreateFlatPaymentPlanDto, userId: string): Promise<FlatPaymentPlan>;
    findAll(): Promise<FlatPaymentPlan[]>;
    findOne(id: string): Promise<FlatPaymentPlan>;
    findByFlatId(flatId: string): Promise<FlatPaymentPlan | null>;
    findByBookingId(bookingId: string): Promise<FlatPaymentPlan | null>;
    updateMilestone(planId: string, milestoneSequence: number, updates: Partial<FlatPaymentMilestone>, userId: string): Promise<FlatPaymentPlan>;
    cancel(id: string, userId: string): Promise<FlatPaymentPlan>;
}
