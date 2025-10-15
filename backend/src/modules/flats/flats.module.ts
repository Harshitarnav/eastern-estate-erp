import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlatsController } from './flats.controller';
import { FlatsService } from './flats.service';
import { Flat } from './entities/flat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Flat])],
  controllers: [FlatsController],
  providers: [FlatsService],
  exports: [FlatsService],
})
export class FlatsModule {}
