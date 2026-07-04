import { IsInt, IsPositive } from 'class-validator';

export class CreateIntentDto {
  @IsInt()
  @IsPositive()
  applicationId: number;
}
