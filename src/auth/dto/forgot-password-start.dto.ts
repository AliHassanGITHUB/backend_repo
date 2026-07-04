import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordStartDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;
}
