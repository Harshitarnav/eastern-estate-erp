import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class IncomingCallDto {
  @IsString()
  CallSid: string;

  @IsString()
  From: string;

  @IsString()
  To: string;

  @IsOptional()
  @IsString()
  CallStatus?: string;

  @IsOptional()
  @IsString()
  Direction?: string;

  @IsOptional()
  @IsNumber()
  propertyId?: number;
}

export class CallStatusDto {
  @IsString()
  CallSid: string;

  @IsString()
  CallStatus: string;

  @IsOptional()
  @IsString()
  CallDuration?: string;

  @IsOptional()
  @IsString()
  RecordingUrl?: string;

  @IsOptional()
  @IsString()
  RecordingSid?: string;

  @IsOptional()
  @IsString()
  StartTime?: string;

  @IsOptional()
  @IsString()
  EndTime?: string;
}

export class RecordingStatusDto {
  @IsString()
  CallSid: string;

  @IsString()
  RecordingUrl: string;

  @IsString()
  RecordingSid: string;

  @IsOptional()
  @IsString()
  RecordingDuration?: string;

  @IsOptional()
  @IsString()
  RecordingStatus?: string;
}

export class MakeCallDto {
  @IsNumber()
  propertyId: number;

  @IsString()
  agentPhone: string;

  @IsString()
  customerPhone: string;

  @IsOptional()
  @IsString()
  callerId?: string;
}

export class CallQueryDto {
  @IsOptional()
  @IsNumber()
  propertyId?: number;

  @IsOptional()
  @IsNumber()
  agentId?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}

