import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EncryptionModule } from 'src/encryption/encryption.module';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy } from './auth-strategy/jwt/jwt.strategy';
import { LocalStrategy } from './auth-strategy/local/local.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionService } from './services/session.service';
import { TokenBlacklistService } from './services/token-blacklist.service';

@Module({
  imports: [
    UserModule,
    EncryptionModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '12h' },
      }),
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
