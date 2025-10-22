import { Repository, DataSource } from 'typeorm';
import { VendorPayment } from './entities/vendor-payment.entity';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorPaymentDto } from './dto/create-vendor-payment.dto';
import { UpdateVendorPaymentDto } from './dto/update-vendor-payment.dto';
export declare class VendorPaymentsService {
    private paymentsRepository;
    private vendorsRepository;
    private dataSource;
    constructor(paymentsRepository: Repository<VendorPayment>, vendorsRepository: Repository<Vendor>, dataSource: DataSource);
    create(createDto: CreateVendorPaymentDto): Promise<VendorPayment>;
    findAll(filters?: {
        vendorId?: string;
        poId?: string;
    }): Promise<VendorPayment[]>;
    findOne(id: string): Promise<VendorPayment>;
    update(id: string, updateDto: UpdateVendorPaymentDto): Promise<VendorPayment>;
    remove(id: string): Promise<void>;
    getTotalPaidToVendor(vendorId: string): Promise<number>;
}
