import { PartialType } from '@nestjs/mapped-types';
import { CreateTowerProgressDto } from './create-tower-progress.dto';

export class UpdateTowerProgressDto extends PartialType(CreateTowerProgressDto) {}
