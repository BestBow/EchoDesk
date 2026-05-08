import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator'
import { ResponsesService } from './responses.service'

class AnswerDto {
  @IsString() questionId: string
  value: unknown
}

class SubmitDto {
  @IsString() formId: string
  @IsArray() answers: AnswerDto[]
  @IsBoolean() @IsOptional() isAnonymous?: boolean
  @IsString() @IsOptional() respondentId?: string
}

@ApiTags('responses')
@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a response to a form — public endpoint' })
  submit(@Body() dto: SubmitDto) {
    return this.responsesService.submit(dto)
  }

  @Get('form/:formId')
  @ApiOperation({ summary: 'Get paginated responses for a form' })
  findByFo(
    @Param('formId') formId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.responsesService.findByForm(formId, +page, +limit)
  }
}
