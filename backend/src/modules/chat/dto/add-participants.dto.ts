import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class AddParticipantsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  employeeIds: string[];
}
