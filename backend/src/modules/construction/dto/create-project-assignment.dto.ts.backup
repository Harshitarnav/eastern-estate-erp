import { IsUUID, IsEnum, IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { AssignmentRole } from '../entities/construction-project-assignment.entity';

export class CreateProjectAssignmentDto {
  @IsUUID()
  constructionProjectId: string;

  @IsUUID()
  employeeId: string;

  @IsEnum(AssignmentRole)
  role: AssignmentRole;

  @IsDateString()
  @IsOptional()
  assignedDate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
