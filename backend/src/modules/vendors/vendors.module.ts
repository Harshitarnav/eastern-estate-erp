import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { VendorPayment } from './entities/vendor-payment.entity';
import { VendorsService } from './vendors.service';
import { VendorPaymentsService } from './vendor-payments.service';
import { VendorsController } from './vendors.controller';
import { VendorPaymentsController } from './vendor-payments.controller';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vendor, VendorPayment]),
    AccountingModule,
  ],
  controllers: [
    VendorsController,
    VendorPaymentsController,
  ],
  providers: [
    VendorsService,
    VendorPaymentsService,
  ],
  exports: [
    VendorsService,
    VendorPaymentsService,
  ],
})
export class VendorsModule {}
