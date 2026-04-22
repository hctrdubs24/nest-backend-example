import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './auth-strategy/local/local.strategy';
import { UserModule } from 'src/user/user.module';
import { EncryptionModule } from 'src/encryption/encryption.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt';
import { JwtStrategy } from './auth-strategy/jwt/jwt.strategy';
import { SessionService } from './services/session.service';
import { TokenBlacklistService } from './services/token-blacklist.service';

@Module({
  imports: [
    UserModule,
    EncryptionModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    SessionService,
    TokenBlacklistService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
