import { CreatePaymentDto } from './create-payment.dto';
import { PaymentStatus } from '../entities/payment.entity';
declare const UpdatePaymentDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreatePaymentDto>>;
export declare class UpdatePaymentDto extends UpdatePaymentDto_base {
    status?: PaymentStatus;
    verifiedBy?: string;
    verifiedAt?: string | Date;
}
export {};
