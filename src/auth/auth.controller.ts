import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from './auth-strategy/jwt/jwt-auth.guard';
import { LocalAuthGuard } from './auth-strategy/local/local-auth.guard';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login.dto';
import { LogoutAllDevicesRequestDto } from './dto/logout.dto';
import { Cookies } from './decorator/cookies/cookies.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Request() req: LoginRequestDto,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ) {
    return this.authService.login(req.user, { ip, ua });
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('refresh')
  async refresh(
    @Cookies('refreshToken') rt: string | undefined,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ) {
    if (!rt) throw new UnauthorizedException('Refresh token missing');

    return this.authService.refresh(rt, { ip, ua });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Headers('authorization') authHeader: string,
    @Body('refresh_token') refreshToken?: string,
  ) {
    const accessToken = authHeader?.split(' ')[1];

    return this.authService.logout(accessToken, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(@Request() req: LogoutAllDevicesRequestDto) {
    return this.authService.logoutFromAllDevices(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile() {
    return;
  }
}
