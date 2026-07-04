import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCredentialsDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  newPassword?: string;
}
