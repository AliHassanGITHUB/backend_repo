import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ForgotPasswordResetDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @Matches(/^[0-9]{4,8}$/, { message: 'otpCode must be a numeric code' })
  otpCode: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
