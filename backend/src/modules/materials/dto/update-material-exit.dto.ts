import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialExitDto } from './create-material-exit.dto';

export class UpdateMaterialExitDto extends PartialType(CreateMaterialExitDto) {}
