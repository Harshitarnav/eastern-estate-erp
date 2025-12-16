import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  // Allow updating customer code when needed and avoid validation errors from extra field
  @IsString()
  @IsOptional()
  @MaxLength(50)
  customerCode?: string;
}
