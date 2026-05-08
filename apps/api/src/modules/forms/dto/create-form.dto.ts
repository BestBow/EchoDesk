import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class CreateQuestionDto {
  @ApiProperty() @IsString() @MinLength(1) title: string
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string

  @ApiProperty()
  @IsEnum(['SHORT_TEXT', 'LONG_TEXT', 'SINGLE_CHOICE', 'MULTI_CHOICE', 'RATING', 'NPS', 'DATE'])
  type: string

  @ApiPropertyOptional() @IsBoolean() @IsOptional() required?: boolean
  @ApiPropertyOptional() @IsArray() @IsOptional() options?: string[]
}

export class CreateFormDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean

  @ApiPropertyOptional({ type: [CreateQuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @IsOptional()
  questions?: CreateQuestionDto[]
}
