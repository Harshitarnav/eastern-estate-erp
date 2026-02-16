import { PaymentPlanTemplateService } from '../services/payment-plan-template.service';
import { CreatePaymentPlanTemplateDto } from '../dto/create-payment-plan-template.dto';
import { UpdatePaymentPlanTemplateDto } from '../dto/update-payment-plan-template.dto';
export declare class PaymentPlanTemplateController {
    private readonly templateService;
    constructor(templateService: PaymentPlanTemplateService);
    create(createDto: CreatePaymentPlanTemplateDto, req: any): Promise<import("../entities/payment-plan-template.entity").PaymentPlanTemplate>;
    findAll(activeOnly?: string): Promise<import("../entities/payment-plan-template.entity").PaymentPlanTemplate[]>;
    findDefault(): Promise<import("../entities/payment-plan-template.entity").PaymentPlanTemplate>;
    findOne(id: string): Promise<import("../entities/payment-plan-template.entity").PaymentPlanTemplate>;
    update(id: string, updateDto: UpdatePaymentPlanTemplateDto, req: any): Promise<import("../entities/payment-plan-template.entity").PaymentPlanTemplate>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
