import { IsArray, IsString, IsUUID, ArrayNotEmpty } from 'class-validator';

export class BulkAssignLeadsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  leadIds: string[];

  @IsString()
  @IsUUID('4')
  assignedTo: string;
}
