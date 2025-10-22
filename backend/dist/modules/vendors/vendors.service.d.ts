import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
export declare class VendorsService {
    private vendorsRepository;
    constructor(vendorsRepository: Repository<Vendor>);
    create(createVendorDto: CreateVendorDto): Promise<Vendor>;
    findAll(filters?: {
        isActive?: boolean;
        rating?: number;
    }): Promise<Vendor[]>;
    findOne(id: string): Promise<Vendor>;
    update(id: string, updateVendorDto: UpdateVendorDto): Promise<Vendor>;
    remove(id: string): Promise<void>;
    updateOutstanding(id: string, amount: number, operation: 'add' | 'subtract'): Promise<Vendor>;
    getTopVendors(limit?: number): Promise<Vendor[]>;
}
