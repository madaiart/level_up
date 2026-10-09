import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import type { StandardSchemaV1 } from '@standard-schema/spec';

/**
 * Validates input against any Standard Schema compliant validator
 * (Zod, Valibot, ArkType, ...) and returns the parsed output.
 */
@Injectable()
export class StandardSchemaValidationPipe<T extends StandardSchemaV1>
  implements PipeTransform<unknown, Promise<StandardSchemaV1.InferOutput<T>>>
{
  constructor(private readonly schema: T) {}

  async transform(value: unknown): Promise<StandardSchemaV1.InferOutput<T>> {
    const result = await this.schema['~standard'].validate(value);

    if (!result.issues) {
      return result.value;
    }

    throw new BadRequestException({
      message: 'Validation failed',
      errors: result.issues.map((issue) => ({
        path: issue.path
          ?.map((segment) =>
            typeof segment === 'object' ? segment.key : segment,
          )
          .join('.'),
        message: issue.message,
      })),
    });
  }
}
