import { IsIn, IsString, Matches, IsOptional, IsArray } from 'class-validator';

const VALID_TYPES = ['image', 'PDF document', 'form'] as const;
const VALID_FORM_INPUT_KINDS = ['text', 'select', 'number', 'group'] as const;

export class CreateRequirementDto {
  @IsString()
  @Matches(/^[A-Z0-9]{2,12}REQ$/, {
    message: 'code must end with REQ (e.g. "PP000001REQ")',
  })
  code!: string;

  @IsString()
  @Matches(/^[A-Z][a-z]{2,}( [A-Z0-9][a-z]*)*$/, {
    message: 'name must be title-cased (e.g. "Personal Photo")',
  })
  name!: string;

  @IsIn(VALID_TYPES)
  type!: string;

  @IsOptional()
  @IsIn(VALID_FORM_INPUT_KINDS)
  form_input_kind?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  form_options?: string[] | null;
}

export class UpdateRequirementDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z][a-z]{2,}( [A-Z0-9][a-z]*)*$/)
  name?: string;

  @IsOptional()
  @IsIn(VALID_TYPES)
  type?: string;

  @IsOptional()
  @IsIn(VALID_FORM_INPUT_KINDS)
  form_input_kind?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  form_options?: string[] | null;
}