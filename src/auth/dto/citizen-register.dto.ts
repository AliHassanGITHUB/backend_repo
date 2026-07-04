import { IsDateString, IsIn, IsNotEmpty, IsString, Matches } from 'class-validator';

// Mirrors CHK_Citizen_Registration_Request_Citizen_Name_Format / Place_Of_Birth:
// first/father/mother-first names and place of birth need >= 3 chars in the first
// word; last names need >= 2. Every later word needs >= 2 chars in all fields.
const LONG_NAME = /^[A-Z][a-z][a-z]+( [A-Z][a-z]+)*$/;
const SHORT_NAME = /^[A-Z][a-z]+( [A-Z][a-z]+)*$/;

export class CitizenRegisterDto {
  @IsString()
  @Matches(/^LBN-[0-9]{4}-[0-9]{5}$/, {
    message: 'nationalId must be in format LBN-YYYY-NNNNN',
  })
  nationalId: string;

  @IsString()
  @Matches(LONG_NAME)
  firstName: string;

  @IsString()
  @Matches(LONG_NAME)
  fatherName: string;

  @IsString()
  @Matches(SHORT_NAME)
  lastName: string;

  @IsString()
  @Matches(LONG_NAME)
  motherFirstName: string;

  @IsString()
  @Matches(SHORT_NAME)
  motherLastName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsString()
  @Matches(LONG_NAME)
  placeOfBirth: string;

  @IsIn(['Male', 'Female'])
  gender: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+961 (01|03|70|71|76|81) [0-9]{3} [0-9]{3}$/, {
    message: 'phoneNumber must be in format +961 XX XXX XXX',
  })
  phoneNumber: string;

  @IsString()
  @Matches(/^[0-9]{4,8}$/, { message: 'otpCode must be a numeric code' })
  otpCode: string;
}
