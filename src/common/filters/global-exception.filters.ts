import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../services';

interface ValidationErrorDetail {
  field: string;
  message: string;
}

interface ValidationErrorResponse {
  status: string;
  error_code: string;
  message: string;
  details: ValidationErrorDetail[];
  timestamp: string;
}

interface NestJSErrorResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    if (status === 400 && this.isValidationError(message)) {
      this.logValidationError(request, message);
    } else if (status >= 500) {
      this.logServerError(request, exception);
    } else {
      this.logClientError(request, status, message);
    }

    const errorResponse = this.buildErrorResponse(message, request.url, status);
    response.status(status).json(errorResponse);
  }

  private isValidationError(
    message: unknown,
  ): message is ValidationErrorResponse {
    if (typeof message !== 'object' || message === null) {
      return false;
    }

    const obj = message as Record<string, unknown>;

    return (
      typeof obj.error_code === 'string' &&
      obj.error_code === 'VALIDATION_ERROR' &&
      Array.isArray(obj.details)
    );
  }

  private logValidationError(
    request: Request,
    message: ValidationErrorResponse,
  ): void {
    const validationDetails: ValidationErrorDetail[] = Array.isArray(
      message.details,
    )
      ? message.details
      : [];

    const fieldsWithErrors = validationDetails
      .map(
        (detail: ValidationErrorDetail) => `${detail.field}: ${detail.message}`,
      )
      .join(', ');

    const userAgent = request.get('user-agent') ?? 'Unknown';
    const clientIp = request.ip ?? 'Unknown';

    this.logger.warn(
      `Validation Error - ${request.method} ${request.url} - Fields: [${fieldsWithErrors}] - IP: ${clientIp} - User-Agent: ${userAgent}`,
      'ValidationFilter',
    );
  }

  private logClientError(
    request: Request,
    status: number,
    message: unknown,
  ): void {
    const errorMessage = this.extractMessageFromResponse(message);
    const clientIp = request.ip ?? 'Unknown';

    this.logger.warn(
      `Client Error ${status} - ${request.method} ${request.url} - ${errorMessage} - IP: ${clientIp}`,
      'ClientErrorFilter',
    );
  }

  private logServerError(request: Request, exception: unknown): void {
    const errorMessage =
      exception instanceof Error ? exception.message : 'Unknown error';
    const stack = exception instanceof Error ? exception.stack : undefined;
    const clientIp = request.ip ?? 'Unknown';

    this.logger.error(
      `Server Error - ${request.method} ${request.url} - ${errorMessage} - IP: ${clientIp}`,
      stack,
      'ServerErrorFilter',
    );
  }

  private extractMessageFromResponse(response: unknown): string {
    if (typeof response === 'string') {
      return response;
    }

    if (this.isNestJSErrorResponse(response)) {
      if (Array.isArray(response.message)) {
        return response.message.join(', ');
      }
      return response.message;
    }

    return this.safeStringify(response);
  }

  private isNestJSErrorResponse(
    response: unknown,
  ): response is NestJSErrorResponse {
    if (typeof response !== 'object' || response === null) {
      return false;
    }

    const obj = response as Record<string, unknown>;
    return (
      (typeof obj.message === 'string' || Array.isArray(obj.message)) &&
      typeof obj.error === 'string' &&
      typeof obj.statusCode === 'number'
    );
  }

  private safeStringify(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object' && value !== null) {
      try {
        return JSON.stringify(value);
      } catch {
        return '[Object - unable to stringify]';
      }
    }

    return String(value);
  }

  private buildErrorResponse(
    message: unknown,
    path: string,
    status: number,
  ): Record<string, unknown> {
    const baseResponse = {
      timestamp: new Date().toISOString(),
      path,
    };

    if (this.isValidationError(message)) {
      return { ...message, ...baseResponse };
    }

    const errorCode = this.getErrorCodeFromStatus(status);
    const extractedMessage = this.extractMessageFromResponse(message);

    return {
      status: 'error',
      error_code: errorCode,
      message: extractedMessage,
      ...baseResponse,
    };
  }

  private readonly statusToErrorCodeMap: Record<number, string> = {
    [HttpStatus.BAD_REQUEST]: 'INVALID_REQUEST',
    [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
    [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
    [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
    [HttpStatus.CONFLICT]: 'CONFLICT',
    [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
    [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_EXCEEDED',
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
  };

  private getErrorCodeFromStatus(status: number): string {
    return this.statusToErrorCodeMap[status] || 'UNKNOWN_ERROR';
  }
}
