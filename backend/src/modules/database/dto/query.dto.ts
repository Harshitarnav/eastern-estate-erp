import { IsString, IsOptional, IsNumber, Min, Max, IsBoolean } from 'class-validator';

export class ExecuteQueryDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  limit?: number = 1000;

  @IsOptional()
  @IsBoolean()
  readonly?: boolean = false;
}

export class UpdateRowDto {
  @IsString()
  table: string;

  @IsString()
  id: string;

  @IsString()
  idColumn: string = 'id';

  data: Record<string, any>;
}

export class InsertRowDto {
  @IsString()
  table: string;

  data: Record<string, any>;
}

export class DeleteRowDto {
  @IsString()
  table: string;

  @IsString()
  id: string;

  @IsString()
  idColumn: string = 'id';
}
