import { PartialType } from '@nestjs/mapped-types';
import { CreateDevelopmentUpdateDto } from './create-development-update.dto';

export class UpdateDevelopmentUpdateDto extends PartialType(CreateDevelopmentUpdateDto) {}
