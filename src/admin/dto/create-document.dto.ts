import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DocumentRequirementItemDto {
  @IsString()
  code: string;

  @IsBoolean()
  isMandatory: boolean;
}

export class CreateDocumentDto {
  @IsString()
  @Matches(/^[A-Z]{2,6}[0-9]{6}DOC$/, {
    message: 'code must match pattern like IC467210DOC',
  })
  code: string;

  @IsString()
  @Matches(/^[A-Z][a-z]{2,}( [A-Z][a-z]{2,})*$/)
  name: string;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  fees: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  processingDays: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  categoryId: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentRequirementItemDto)
  requirements?: DocumentRequirementItemDto[];
}

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z][a-z]{2,}( [A-Z][a-z]{2,})*$/)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  fees?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  processingDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  categoryId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentRequirementItemDto)
  requirements?: DocumentRequirementItemDto[];
}
