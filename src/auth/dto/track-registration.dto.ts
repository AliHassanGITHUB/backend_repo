import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class TrackRegistrationDto {
  @IsString()
  @Matches(/^LBN-[0-9]{4}-[0-9]{5}$/, {
    message: 'nationalId must be in format LBN-YYYY-NNNNN',
  })
  nationalId: string;

  @IsString()
  @IsNotEmpty()
  referenceNumber: string;
}
