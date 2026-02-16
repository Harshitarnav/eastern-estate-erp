import { FlatPaymentPlanService } from '../services/flat-payment-plan.service';
import { CreateFlatPaymentPlanDto } from '../dto/create-flat-payment-plan.dto';
import { FlatPaymentMilestone } from '../entities/flat-payment-plan.entity';
export declare class FlatPaymentPlanController {
    private readonly flatPaymentPlanService;
    constructor(flatPaymentPlanService: FlatPaymentPlanService);
    create(createDto: CreateFlatPaymentPlanDto, req: any): Promise<import("../entities/flat-payment-plan.entity").FlatPaymentPlan>;
    findAll(): Promise<import("../entities/flat-payment-plan.entity").FlatPaymentPlan[]>;
    findByFlatId(flatId: string): Promise<import("../entities/flat-payment-plan.entity").FlatPaymentPlan>;
    findByBookingId(bookingId: string): Promise<import("../entities/flat-payment-plan.entity").FlatPaymentPlan>;
    findOne(id: string): Promise<import("../entities/flat-payment-plan.entity").FlatPaymentPlan>;
    updateMilestone(id: string, sequence: string, updates: Partial<FlatPaymentMilestone>, req: any): Promise<import("../entities/flat-payment-plan.entity").FlatPaymentPlan>;
    cancel(id: string, req: any): Promise<import("../entities/flat-payment-plan.entity").FlatPaymentPlan>;
}
