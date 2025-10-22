import { VendorPaymentsService } from './vendor-payments.service';
import { CreateVendorPaymentDto } from './dto/create-vendor-payment.dto';
import { UpdateVendorPaymentDto } from './dto/update-vendor-payment.dto';
export declare class VendorPaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: VendorPaymentsService);
    create(createDto: CreateVendorPaymentDto): Promise<import("./entities/vendor-payment.entity").VendorPayment>;
    findAll(vendorId?: string, poId?: string): Promise<import("./entities/vendor-payment.entity").VendorPayment[]>;
    getTotalPaid(vendorId: string): Promise<number>;
    findOne(id: string): Promise<import("./entities/vendor-payment.entity").VendorPayment>;
    update(id: string, updateDto: UpdateVendorPaymentDto): Promise<import("./entities/vendor-payment.entity").VendorPayment>;
    remove(id: string): Promise<void>;
}
