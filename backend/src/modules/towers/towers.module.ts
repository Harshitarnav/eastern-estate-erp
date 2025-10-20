import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TowersController } from './towers.controller';
import { TowersService } from './towers.service';
import { Tower } from './entities/tower.entity';
import { Property } from '../properties/entities/property.entity';
import { Flat } from '../flats/entities/flat.entity';
import { TowersSchemaSyncService } from './towers.schema-sync.service';
import { Booking } from '../bookings/entities/booking.entity';
import { ConstructionProject } from '../construction/entities/construction-project.entity';

/**
 * Towers Module
 * 
 * Encapsulates all tower-related functionality.
 * Provides dependency injection and module organization.
 * 
 * Eastern Estate Module Architecture:
 * - Clean separation of concerns
 * - Proper dependency management
 * - Easy to maintain and scale
 * 
 * This module handles:
 * - Tower CRUD operations
 * - Property-Tower relationships
 * - Tower filtering and search
 * - Construction status tracking
 * - Statistics and reporting
 * 
 * Dependencies:
 * - Tower entity for database operations
 * - Property entity for relationship validation
 * - TypeORM for database access
 * 
 * @module TowersModule
 */
@Module({
  imports: [
    // Register entities with TypeORM
    TypeOrmModule.forFeature([Tower, Property, Flat, Booking, ConstructionProject]),
  ],
  controllers: [TowersController],
  providers: [TowersService, TowersSchemaSyncService],
  exports: [TowersService], // Export service for use in other modules
})
export class TowersModule {}
