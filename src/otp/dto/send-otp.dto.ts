import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+961 (01|03|70|71|76|81) [0-9]{3} [0-9]{3}$/, {
    message: 'phoneNumber must be in format +961 XX XXX XXX',
  })
  phoneNumber: string;
}
