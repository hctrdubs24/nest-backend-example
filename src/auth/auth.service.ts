import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EncryptionService } from 'src/encryption/encryption.service';
import { UserMapper } from 'src/user/mappers/user.mapper';
import { UserService } from 'src/user/user.service';
import { JwtSingRequestDto } from './dto/jwt-payload.dto';
import { LoginDTO } from './dto/login.dto';
import { SessionService } from './services/session.service';
import { TokenBlacklistService } from './services/token-blacklist.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly backlistTokenService: TokenBlacklistService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async validate(loginDto: LoginDTO) {
    const { email, password } = loginDto;

    const user = await this.userService.findByEmail(email);

    if (!user) {
      this.logger.warn(
        { email, action: 'login_failed', reason: 'user_not_found' },
        'Intento de login fallido',
      );
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await this.encryptionService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(
        {
          userId: user.id,
          email,
          action: 'login_failed',
          reason: 'invalid_password',
        },
        'Credenciales inválidas',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    return UserMapper.toJwtSign(user);
  }

  async login(user: JwtSingRequestDto, metadata: { ip: string; ua: string }) {
    this.logger.log(
      {
        userId: user.id,
        email: user.email,
        ...metadata,
        action: 'login_success',
      },
      'Usuario autenticado exitosamente',
    );

    const tokens = await this.generateTokens(user);
    await this.sessionService.createSession(
      user.id,
      tokens.refreshToken,
      metadata,
    );

    return tokens;
  }

  async logout(
    accessToken: string | undefined,
    refreshToken: string | undefined,
  ) {
    if (accessToken) {
      const cleanToken = accessToken.trim();
      const payload = this.jwtService.decode<{ sub: number; exp: number }>(
        cleanToken,
      );

      if (payload && payload.exp) {
        const expiresAt = new Date(payload.exp * 1000);
        await this.backlistTokenService.revoke(cleanToken, expiresAt);
        this.logger.log(
          { userId: payload.sub, action: 'logout' },
          'Sesión cerrada (AccessToken revocado)',
        );
      }
    }

    if (refreshToken) {
      await this.sessionService.deleteSession(refreshToken);
    }

    return { message: 'LogOut successful' };
  }

  async logoutFromAllDevices(userId: number) {
    await this.userService.incrementTokenVersion(userId);
    await this.sessionService.deleteAllSessions(userId);

    this.logger.warn(
      { userId, action: 'logout_all' },
      'Cierre de sesión global realizado',
    );

    return { message: 'Se ha cerrado la sesión en todos los dispositivos' };
  }

  async refresh(oldRefreshToken: string, metadata: { ip: string; ua: string }) {
    const session = await this.sessionService.findSession(oldRefreshToken);

    if (!session || session.expiresAt < new Date()) {
      this.logger.warn(
        { ...metadata, action: 'refresh_token_failed' },
        'Intento de refresco con sesión inválida/expirada',
      );
      throw new UnauthorizedException('Expired session');
    }

    const user = await this.userService.findOneByIdAndEnabled(session.userId);

    // Rotación: Eliminar sesión antigua y crear nueva
    await this.sessionService.deleteSession(oldRefreshToken);

    const tokens = await this.generateTokens(user);
    await this.sessionService.createSession(
      user.id,
      tokens.refreshToken,
      metadata,
    );

    this.logger.log(
      { userId: user.id, action: 'token_refresh' },
      'Tokens renovados exitosamente',
    );

    return tokens;
  }

  private async generateTokens(user: JwtSingRequestDto) {
    const payload = {
      username: user.name,
      sub: user.id,
      v: user.tokenVersion,
      role: user.roleName,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return { access_token: at, refreshToken: rt };
  }
}
