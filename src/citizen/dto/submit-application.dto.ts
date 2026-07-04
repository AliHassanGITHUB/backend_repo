import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitApplicationDto {
  @IsString()
  @IsNotEmpty()
  documentCode: string;
}
