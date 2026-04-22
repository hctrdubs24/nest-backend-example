import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import z, { ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((err) => {
          const path = err.path.join('.');
          return `${path} ${err.message}`.toLocaleLowerCase();
        });
        throw new BadRequestException(message);
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
