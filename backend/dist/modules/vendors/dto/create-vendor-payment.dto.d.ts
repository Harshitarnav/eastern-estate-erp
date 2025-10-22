import { PaymentMode } from '../entities/vendor-payment.entity';
export declare class CreateVendorPaymentDto {
    vendorId: string;
    purchaseOrderId?: string;
    paymentDate: string;
    amount: number;
    paymentMode: PaymentMode;
    transactionReference?: string;
    notes?: string;
}
