import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentPlanTemplateDto } from './create-payment-plan-template.dto';

export class UpdatePaymentPlanTemplateDto extends PartialType(CreatePaymentPlanTemplateDto) {}
