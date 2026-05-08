import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'
import { AuthService } from './auth.service'

class ExchangeTokenDto {
  @IsString()
  @MinLength(10)
  idToken: string
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('exchange')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a Firebase ID token for an EchoDesk JWT' })
  @ApiResponse({ status: 200, description: 'Returns JWT access token and user object' })
  @ApiResponse({ status: 401, description: 'Invalid or expired Firebase token' })
  exchange(@Body() dto: ExchangeTokenDto) {
    return this.authService.exchangeToken(dto.idToken)
  }
}
