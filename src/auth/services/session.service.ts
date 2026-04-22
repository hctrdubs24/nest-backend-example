import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(private readonly prismaService: PrismaService) {}

  async createSession(
    userId: number,
    refreshToken: string,
    metadata: { ip: string; ua: string },
  ) {
    return this.prismaService.session.create({
      data: {
        userId,
        refreshToken,
        ipAddress: metadata.ip,
        userAgent: metadata.ua,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async findSession(refreshToken: string) {
    return this.prismaService.session.findUnique({ where: { refreshToken } });
  }

  async deleteSession(refreshToken: string) {
    return this.prismaService.session
      .delete({ where: { refreshToken } })
      .catch(() => null);
  }

  async deleteAllSessions(userId: number) {
    return this.prismaService.session.deleteMany({
      where: { userId },
    });
  }
}
