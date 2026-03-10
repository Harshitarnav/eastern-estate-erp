import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';
import { IsOptional, IsUUID, IsString } from 'class-validator';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  // status is already an optional @IsString() in the base DTO via PartialType, but keep explicit override
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  verifiedBy?: string;

  @IsOptional()
  verifiedAt?: string | Date;
}
