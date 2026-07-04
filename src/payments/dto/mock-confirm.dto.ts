import { IsInt, IsPositive } from 'class-validator';

export class MockConfirmDto {
  @IsInt()
  @IsPositive()
  applicationId: number;
}
