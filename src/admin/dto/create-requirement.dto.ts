import { IsIn, IsString, Matches, IsOptional } from 'class-validator';

const VALID_TYPES = ['image', 'PDF document', 'form'] as const;

export class CreateRequirementDto {
  @IsString()
  @Matches(/^[A-Z0-9]{2,12}REQ$/, {
    message: 'code must end with REQ (e.g. "PP000001REQ")',
  })
  code: string;

  @IsString()
  @Matches(/^[A-Z][a-z]{2,}( [A-Z0-9][a-z]*)*$/, {
    message: 'name must be title-cased (e.g. "Personal Photo")',
  })
  name: string;

  @IsIn(VALID_TYPES)
  type: string;
}

export class UpdateRequirementDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z][a-z]{2,}( [A-Z0-9][a-z]*)*$/)
  name?: string;

  @IsOptional()
  @IsIn(VALID_TYPES)
  type?: string;
}
