import { BadRequestException, ValidationPipe } from '@nestjs/common';

export const globalValidationPipe = new ValidationPipe({
  transform: true,
  stopAtFirstError: true,
  exceptionFactory: (errors) => {
    const errorMessages = errors.map((err) => {
      const constraints = err.constraints;
      const firstMessage = constraints
        ? Object.values(constraints)[0]
        : 'Validation failed';
      return {
        field: err.property,
        message: firstMessage,
      };
    });

    return new BadRequestException({
      status: 'error',
      error_code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errorMessages,
      timestamp: new Date().toISOString(),
    });
  },
});
