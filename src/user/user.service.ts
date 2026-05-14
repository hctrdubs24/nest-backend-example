import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EncryptionService } from 'src/encryption/encryption.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserMapper } from './mappers/user.mapper';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  private readonly logger = new Logger(UserService.name, { timestamp: true });

  private auditLog(action: string, metadata: Record<string, any>) {
    this.logger.log({
      action,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  async create(userDto: CreateUserDto) {
    const hashedPassword = await this.encryptionService.encrypt(
      userDto.password,
    );
    const data: CreateUserDto = {
      ...userDto,
      password: hashedPassword,
    };

    const createdUser = await this.prisma.user.create({ data });

    this.auditLog('user_created', { targetUserId: createdUser.id });

    return UserMapper.toResponse(createdUser);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      where: { status: true },
      include: { role: true },
    });
    return UserMapper.toResponseList(users);
  }

  async findOne(email: string) {
    const userFound = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase(), status: true },
      include: { role: true },
    });

    if (!userFound)
      throw new NotFoundException(`User with email ${email} not found`);

    return UserMapper.toResponse(userFound);
  }

  async update(id: number, userDto: UpdateUserDto) {
    await this.findOneByIdAndEnabled(id);

    const data = { ...userDto };

    if (data.password && typeof data.password === 'string') {
      data.password = await this.encryptionService.encrypt(data.password);
    }

    const updatedUser = await this.prisma.user.update({ data, where: { id } });

    this.auditLog('user_updated', {
      targetUserId: id,
      fieldsUpdated: Object.keys(userDto),
    });

    return UserMapper.toResponse(updatedUser);
  }

  async remove(id: number) {
    await this.findOneByIdAndEnabled(id);

    const removedUser = await this.prisma.user.update({
      data: { status: false },
      where: { id },
    });

    this.auditLog('user_deactivated', { targetUserId: id });

    return UserMapper.toResponse(removedUser);
  }

  async findByEmail(email: string) {
    const userFound = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase(), status: true },
      include: { role: true },
    });

    return userFound;
  }

  async findOneByIdAndEnabled(id: number) {
    const userFound = await this.prisma.user.findUnique({
      where: { id, status: true },
      include: { role: true },
    });

    if (!userFound) throw new NotFoundException(`User with id ${id} not found`);

    return userFound;
  }

  async incrementTokenVersion(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { tokenVersion: { increment: 1 } },
    });
  }
}
