import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlatsController } from './flats.controller';
import { FlatsService } from './flats.service';
import { Flat } from './entities/flat.entity';
import { FlatsSchemaSyncService } from './flats.schema-sync.service';
import { Tower } from '../towers/entities/tower.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Flat, Tower])],
  controllers: [FlatsController],
  providers: [FlatsService, FlatsSchemaSyncService],
  exports: [FlatsService],
})
export class FlatsModule {}
