import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  adminNationalId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @Max(9999)
  adminCode: number;

  @IsString()
  @IsNotEmpty()
  password: string;
}
