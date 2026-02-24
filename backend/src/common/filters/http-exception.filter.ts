import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log error for debugging — for validation errors (400) include the field details
    if (status === HttpStatus.BAD_REQUEST && exception instanceof HttpException) {
      const responseBody = exception.getResponse();
      const details =
        typeof responseBody === 'object' && (responseBody as any).message
          ? JSON.stringify((responseBody as any).message)
          : String(responseBody);
      this.logger.error(`${request.method} ${request.url} - Validation errors: ${details}`);
    } else {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );
    }

    // Clear, user-friendly error response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: this.getErrorMessage(message, status),
      errors: this.getValidationErrors(message),
      ...(process.env.NODE_ENV === 'development' && {
        details: message,
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    response.status(status).json(errorResponse);
  }

  private getErrorMessage(message: any, status: number): string {
    // User-friendly error messages
    const errorMessages: Record<number, string> = {
      400: 'Invalid input. Please check your data and try again.',
      401: 'Authentication required. Please log in to continue.',
      403: "You don't have permission to perform this action.",
      404: 'The requested resource was not found.',
      409: 'This record already exists or conflicts with existing data.',
      422: 'The data you provided is invalid. Please check and try again.',
      429: 'Too many requests. Please try again later.',
      500: 'Something went wrong on our end. Please try again later.',
      503: 'Service temporarily unavailable. Please try again later.',
    };

    // Handle validation errors from class-validator
    if (typeof message === 'object' && message.message) {
      if (Array.isArray(message.message)) {
        return 'Please fix the following errors and try again.';
      }
      return message.message;
    }

    if (typeof message === 'string') {
      return message;
    }

    return errorMessages[status] || 'An error occurred. Please try again.';
  }

  private getValidationErrors(message: any): string[] | undefined {
    // Handle NestJS validation pipe errors
    if (typeof message === 'object' && Array.isArray(message.message)) {
      return message.message.map((msg: any) => {
        // If msg is a string, return it
        if (typeof msg === 'string') {
          return msg;
        }
        // If msg is an object with constraints, extract the error messages
        if (typeof msg === 'object' && msg.constraints) {
          return Object.values(msg.constraints).join('. ');
        }
        return String(msg);
      }).filter(Boolean);
    }
    return undefined;
  }
}

// Export alias for backward compatibility
export { AllExceptionsFilter as HttpExceptionFilter };
