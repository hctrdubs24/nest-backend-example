import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TokenBlacklistService {
  constructor(private readonly prismaService: PrismaService) {}

  async revoke(token: string, expiresAt: Date) {
    const data = { token, expiresAt };
    await this.prismaService.revokedToken.create({ data });
  }

  async isRevoked(token: string): Promise<boolean> {
    const revoked = await this.prismaService.revokedToken.findUnique({
      where: { token },
    });

    return !!revoked;
  }
}
