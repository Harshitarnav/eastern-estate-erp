import { PartialType } from '@nestjs/mapped-types';
import { CreateDemandDraftTemplateDto } from './create-demand-draft-template.dto';

export class UpdateDemandDraftTemplateDto extends PartialType(CreateDemandDraftTemplateDto) {}
