import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsString } from 'class-validator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { WorkspacesService } from './workspaces.service'
import { User } from '@prisma/client'

class CreateWorkspaceDto {
  @IsString() name: string
}

class InviteMemberDto {
  @IsEmail() email: string
  @IsEnum(['ADMIN', 'MANAGER', 'VIEWER']) role: string
}

class UpdateRoleDto {
  @IsEnum(['ADMIN', 'MANAGER', 'VIEWER']) role: string
}

@ApiTags('workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  create(@CurrentUser() user: User, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.create(user.id, dto.name)
  }

  @Get()
  @ApiOperation({ summary: 'Get all workspaces for current user' })
  findMyWorkspaces(@CurrentUser() user: User) {
    return this.workspacesService.findByUser(user.id)
  }

  @Get(':workspaceId')
  @ApiOperation({ summary: 'Get a workspace by ID' })
  findOne(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.findById(workspaceId)
  }

  @Get(':workspaceId/members')
  @ApiOperation({ summary: 'Get all members of a workspace' })
  getMembers(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.getMembers(workspaceId)
  }

  @Post(':workspaceId/members')
  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Invite a member to workspace' })
  invite(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.workspacesService.inviteMember(workspaceId, dto.email, dto.role)
  }

  @Patch(':workspaceId/members/:userId/role')
  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a member role' })
  updateRole(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.workspacesService.updateMemberRole(workspaceId, userId, dto.role)
  }

  @Delete(':workspaceId/members/:userId')
  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Remove a member from workspace' })
  removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: User,
  ) {
    return this.workspacesService.removeMember(workspaceId, userId, user.id)
  }
}
