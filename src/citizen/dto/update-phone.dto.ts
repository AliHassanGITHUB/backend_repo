import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdatePhoneDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+961 (01|03|70|71|76|81) [0-9]{3} [0-9]{3}$/, {
    message: 'newPhoneNumber must be in format +961 XX XXX XXX',
  })
  newPhoneNumber: string;

  @IsString()
  @Matches(/^[0-9]{4,8}$/, { message: 'otpCode must be a numeric code' })
  otpCode: string;
}
