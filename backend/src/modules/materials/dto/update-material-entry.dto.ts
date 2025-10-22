import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialEntryDto } from './create-material-entry.dto';

export class UpdateMaterialEntryDto extends PartialType(CreateMaterialEntryDto) {}
