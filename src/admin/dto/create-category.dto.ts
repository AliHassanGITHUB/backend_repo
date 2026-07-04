import { IsString, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Matches(/^[A-Z][a-z]{2,}( [A-Z][a-z]{2,})*$/, {
    message: 'name must be title-cased words of 3+ letters each',
  })
  name: string;
}
