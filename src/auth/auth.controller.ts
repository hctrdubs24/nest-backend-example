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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth-strategy/jwt/jwt-auth.guard';
import { LocalAuthGuard } from './auth-strategy/local/local-auth.guard';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login.dto';

interface AuthenticatedRequest {
  user: {
    userId: number;
    username: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Post('refresh')
  async refresh(
    @Body('refresh_token') rt: string,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ) {
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
  async logoutAll(@Request() req: AuthenticatedRequest) {
    return this.authService.logoutFromAllDevices(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile() {
    return;
  }
}
