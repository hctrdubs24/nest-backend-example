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

  async create(userDto: CreateUserDto) {
    const hashedPassword = await this.encryptionService.encrypt(
      userDto.password,
    );
    const data: CreateUserDto = {
      ...userDto,
      password: hashedPassword,
    };

    const createdUser = await this.prisma.user.create({ data });

    this.logger.log(
      {
        userId: createdUser.id,
        email: createdUser.email,
        action: 'user_created',
      },
      'Nuevo usuario registrado',
    );

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

    this.logger.log(
      {
        targetUserId: id,
        fieldsUpdated: Object.keys(userDto),
        action: 'user_updated',
      },
      'Usuario actualizado',
    );

    return UserMapper.toResponse(updatedUser);
  }

  async remove(id: number) {
    await this.findOneByIdAndEnabled(id);

    const removedUser = await this.prisma.user.update({
      data: { status: false },
      where: { id },
    });

    this.logger.warn(
      { targetUserId: id, action: 'user_deactivated' },
      'Usuario desactivado (soft delete)',
    );

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
