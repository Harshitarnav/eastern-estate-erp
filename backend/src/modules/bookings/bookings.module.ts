import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { Flat } from '../flats/entities/flat.entity';
import { Property } from '../properties/entities/property.entity';
import { Tower } from '../towers/entities/tower.entity';
import { Customer } from '../customers/entities/customer.entity';
import { PaymentsModule } from '../payments/payments.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Flat, Property, Tower, Customer]),
    PaymentsModule,
    NotificationsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
