import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { HttpAdapterHost } from '@nestjs/core';
import { log } from 'console';
import { PrismaClientKnownRequestError } from 'src/generated/prisma/internal/prismaNamespace';

@Catch(PrismaClientKnownRequestError)
export class PrismaClientFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    switch (exception.code) {
      case 'P2025': // Record not found
        statusCode = HttpStatus.NOT_FOUND;
        message = (exception.meta?.cause as string) || 'Resource not found';
        break;

      case 'P2002': {
        // Unique constraint violation
        statusCode = HttpStatus.CONFLICT;

        const target = exception.meta?.target;
        let fieldName = '';

        if (Array.isArray(target)) {
          fieldName = target.join(', ');
        } else {
          const match = exception.message.match(/on the fields: \(`([^`]+)`\)/);
          if (match && match[1]) fieldName = match[1];
        }

        message = fieldName
          ? `The field '${fieldName}' is already in use`
          : 'The record with this data already exists';
        break;
      }
    }

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${exception.code}] ${exception.message}`,
        exception.stack,
      );
    }

    const responseBody = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request) as string,
    };

    httpAdapter.reply(response, responseBody, statusCode);
  }
}
