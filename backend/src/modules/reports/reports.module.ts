import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { FlatPaymentPlan } from '../payment-plans/entities/flat-payment-plan.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Flat } from '../flats/entities/flat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FlatPaymentPlan, Payment, Flat])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
