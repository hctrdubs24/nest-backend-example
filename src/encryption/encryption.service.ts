import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, genSalt, hash } from 'bcrypt';

@Injectable()
export class EncryptionService {
  private readonly saltRounds: number;

  constructor(private readonly configService: ConfigService) {
    this.saltRounds = Number(this.configService.get('AUTH_SALT_ROUNDS', 10));
  }

  async encrypt(plainText: string): Promise<string> {
    const salt: number = Number(await genSalt(this.saltRounds));
    const hashedString: string = await hash(plainText, salt);
    return hashedString;
  }

  async compare(plainText: string, hashedString: string): Promise<boolean> {
    const isMatch: boolean = await compare(plainText, hashedString);
    return isMatch;
  }
}
