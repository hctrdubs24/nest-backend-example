import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import 'dotenv/config';
import { PrismaClient } from 'src/generated/prisma/client';
import { UserExtension } from './prisma.extension';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    const url = configService.getOrThrow<string>('DATABASE_URL');
    if (!url) throw new Error('DATABASE_URL is not defined');
    const adapter = new PrismaBetterSqlite3({ url });

    super({
      adapter,
      log:
        configService.get('NODE_ENV') === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });

    Object.assign(this, this.$extends(UserExtension));
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
