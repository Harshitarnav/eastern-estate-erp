import { Repository } from 'typeorm';
import { PaymentPlanTemplate } from '../entities/payment-plan-template.entity';
import { CreatePaymentPlanTemplateDto } from '../dto/create-payment-plan-template.dto';
import { UpdatePaymentPlanTemplateDto } from '../dto/update-payment-plan-template.dto';
export declare class PaymentPlanTemplateService {
    private readonly templateRepository;
    constructor(templateRepository: Repository<PaymentPlanTemplate>);
    create(createDto: CreatePaymentPlanTemplateDto, userId: string): Promise<PaymentPlanTemplate>;
    findAll(activeOnly?: boolean): Promise<PaymentPlanTemplate[]>;
    findOne(id: string): Promise<PaymentPlanTemplate>;
    findDefault(): Promise<PaymentPlanTemplate | null>;
    update(id: string, updateDto: UpdatePaymentPlanTemplateDto, userId: string): Promise<PaymentPlanTemplate>;
    remove(id: string, userId: string): Promise<void>;
}
