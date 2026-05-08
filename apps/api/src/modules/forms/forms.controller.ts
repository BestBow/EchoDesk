import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { FormsService } from './forms.service'
import { CreateFormDto } from './dto/create-form.dto'
import { UpdateFormDto } from './dto/update-form.dto'
import { User } from '@prisma/client'

@ApiTags('forms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new form' })
  create(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateFormDto,
  ) {
    return this.formsService.create(workspaceId, user.id, dto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all forms in a workspace' })
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.formsService.findAllByWorkspace(workspaceId)
  }

  @Get(':formId')
  @ApiOperation({ summary: 'Get a single form by ID' })
  findOne(@Param('formId') formId: string) {
    return this.formsService.findById(formId)
  }

  @Patch(':formId')
  @ApiOperation({ summary: 'Update form title, description, settings' })
  update(@Param('formId') formId: string, @Body() dto: UpdateFormDto) {
    return this.formsService.update(formId, dto)
  }

  @Patch(':formId/publish')
  @ApiOperation({ summary: 'Publish a form — starts accepting responses' })
  publish(@Param('formId') formId: string) {
    return this.formsService.publish(formId)
  }

  @Patch(':formId/pause')
  @ApiOperation({ summary: 'Pause a form — stops accepting responses temporarily' })
  pause(@Param('formId') formId: string) {
    return this.formsService.pause(formId)
  }

  @Patch(':formId/ave')
  @ApiOperation({ summary: 'Archive a form' })
  archive(@Param('formId') formId: string) {
    return this.formsService.archive(formId)
  }

  @Delete(':formId')
  @ApiOperation({ summary: 'Delete a form permanently' })
  remove(@Param('formId') formId: string) {
    return this.formsService.remove(formId)
  }
}

@ApiTags('public')
@Controller('public/forms')
export class PublicFormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get(':formId')
  @ApiOperation({ summary: 'Get an active form for public submission — no auth required' })
  findPublic(@Param('formId') formId: string) {
    return this.formsService.findPublicForm(formId)
  }
}
