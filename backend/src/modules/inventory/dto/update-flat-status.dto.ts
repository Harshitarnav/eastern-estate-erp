import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class UpdateFlatStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['Available', 'Blocked', 'Booked', 'Sold', 'Released'])
  status: string;
}