import {
  Controller,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { UploadsService } from './uploads.service'
import { UsersService } from '../users/users.service'
import { User } from '@prisma/client'

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('avatar')
  @ApiOperation({ summary: 'Upload or replace current user avatar' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { url } = await this.uploadsService.uploadAvatar(file, user.id)
    await this.usersService.updateProfile(user.id, { avatarUrl: url })
    return { avatarUrl: url }
  }

  @Post('workspace/:workspaceId/logo')
  @ApiOperation({ summary: 'Upload or replace workspace logo' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadLogo(
    @Param('workspaceId') workspaceId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { url } = await this.uploadsService.uploadWorkspaceLogo(file, workspaceId)
    return { logoUrl: url }
  }
}
