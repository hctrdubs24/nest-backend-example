import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import { TokenBlacklistService } from 'src/auth/services/token-blacklist.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly blackListservice: TokenBlacklistService,
    private readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayloadDto) {
    const authHeader = req.get('Authorization');
    if (!authHeader) throw new UnauthorizedException();

    const token = authHeader.replace('Bearer ', '');

    // 1. Deny list verification
    if (await this.blackListservice.isRevoked(token))
      throw new UnauthorizedException('Revoked token');

    const user = await this.userService.findOneByIdAndEnabled(payload.sub);
    if (!user) throw new UnauthorizedException('User does not exist');
    if (!user.status) throw new UnauthorizedException('Suspended account');

    if (payload.v !== user.tokenVersion) {
      throw new UnauthorizedException(
        'Sesión expirada por cambio de credenciales',
      );
    }

    return {
      userId: payload.sub,
      username: payload.username,
      role: user.role?.name,
    };
  }
}
