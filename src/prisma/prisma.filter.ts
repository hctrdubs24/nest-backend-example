import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { Prisma } from 'src/generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response = ctx.getResponse();

    switch (exception.code) {
      case 'P2025': // Record not found
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: 404,
          message: 'Registro no encontrado',
        });
        break;

      case 'P2002': // Unique constraint violation
        response.status(HttpStatus.CONFLICT).json({
          statusCode: 409,
          message: 'El registro ya existe',
        });
        break;

      default:
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: 500,
          message: 'Error interno del servidor',
        });
    }
  }
}
