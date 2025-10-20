import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { Property } from './entities/property.entity';
import { Project } from '../projects/entities/project.entity';
import { Tower } from '../towers/entities/tower.entity';
import { Flat } from '../flats/entities/flat.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { ConstructionProject } from '../construction/entities/construction-project.entity';
import { PropertiesSchemaSyncService } from './properties.schema-sync.service';

@Module({
  imports: [TypeOrmModule.forFeature([Property, Project, Tower, Flat, Customer, Booking, ConstructionProject])],
  controllers: [PropertiesController],
  providers: [PropertiesService, PropertiesSchemaSyncService],
  exports: [PropertiesService, TypeOrmModule],
})
export class PropertiesModule {}
