import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { AnalyticsService } from './analytics.service'

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('forms/:formId')
  @ApiOperation({ summary: 'Get analytics breakdown for a form' })
  getFormAnalytics(@Param('formId') formId: string) {
    return this.analyticsService.getFormAnalytics(formId)
  }

  @Get('forms/:formId/ai-summary')
  @ApiOperation({ summary: 'Get AI-generated summary of text responses' })
  getAiSummary(@Param('formId') formId: string) {
    return this.analyticsService.getAiSummary(formId)
  }
}
