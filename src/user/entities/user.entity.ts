import { User as PrismaUser } from 'src/generated/prisma/client';

export type User = PrismaUser;

export type UserDTO = Omit<PrismaUser, 'password' | 'status'>;
