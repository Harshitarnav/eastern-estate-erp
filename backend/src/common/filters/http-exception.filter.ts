import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as any;
        message = resp.message || message;
        error = resp.error || error;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof QueryFailedError) {
      // Handle TypeORM database errors
      const dbError = exception as any;
      
      // Comprehensive PostgreSQL error code handling
      switch (dbError.code) {
        // Class 23 - Integrity Constraint Violation
        case '23000':
          status = HttpStatus.BAD_REQUEST;
          error = 'Integrity Constraint Violation';
          message = 'Data integrity violation. Please check your input.';
          break;
        case '23001':
          status = HttpStatus.BAD_REQUEST;
          error = 'Restrict Violation';
          message = 'This record cannot be modified as it is referenced by other records.';
          break;
        case '23502':
          status = HttpStatus.BAD_REQUEST;
          error = 'Not Null Violation';
          message = 'Required field is missing. Please fill all required fields.';
          break;
        case '23503':
          status = HttpStatus.BAD_REQUEST;
          error = 'Foreign Key Violation';
          message = 'Referenced record not found. Please check related data.';
          break;
        case '23505':
          status = HttpStatus.CONFLICT;
          error = 'Duplicate Entry';
          message = 'This record already exists. Please use unique values.';
          break;
        case '23514':
          status = HttpStatus.BAD_REQUEST;
          error = 'Check Violation';
          message = 'Data validation failed. Please check the constraints.';
          break;

        // Class 22 - Data Exception
        case '22000':
          status = HttpStatus.BAD_REQUEST;
          error = 'Data Exception';
          message = 'Invalid data provided.';
          break;
        case '22001':
          status = HttpStatus.BAD_REQUEST;
          error = 'String Data Right Truncation';
          message = 'Text is too long for the field. Please shorten your input.';
          break;
        case '22003':
          status = HttpStatus.BAD_REQUEST;
          error = 'Numeric Value Out of Range';
          message = 'Number is too large or too small for this field.';
          break;
        case '22007':
          status = HttpStatus.BAD_REQUEST;
          error = 'Invalid Datetime Format';
          message = 'Invalid date or time format provided.';
          break;
        case '22008':
          status = HttpStatus.BAD_REQUEST;
          error = 'Datetime Field Overflow';
          message = 'Date or time value is out of valid range.';
          break;
        case '22012':
          status = HttpStatus.BAD_REQUEST;
          error = 'Division by Zero';
          message = 'Mathematical operation error: Division by zero.';
          break;
        case '22P02':
          status = HttpStatus.BAD_REQUEST;
          error = 'Invalid Text Representation';
          message = 'Invalid data format. Please check the data type.';
          break;

        // Class 42 - Syntax Error or Access Rule Violation
        case '42501':
          status = HttpStatus.FORBIDDEN;
          error = 'Insufficient Privileges';
          message = 'You do not have permission to perform this operation.';
          break;
        case '42601':
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          error = 'Syntax Error';
          message = 'Database query error. Please contact support.';
          break;
        case '42703':
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          error = 'Undefined Column';
          message = 'Database schema error. Please contact support.';
          break;
        case '42P01':
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          error = 'Undefined Table';
          message = 'Database table not found. Please contact support.';
          break;

        // Class 08 - Connection Exception
        case '08000':
        case '08003':
        case '08006':
          status = HttpStatus.SERVICE_UNAVAILABLE;
          error = 'Database Connection Error';
          message = 'Unable to connect to database. Please try again later.';
          break;

        // Class 53 - Insufficient Resources
        case '53000':
        case '53100':
        case '53200':
        case '53300':
          status = HttpStatus.SERVICE_UNAVAILABLE;
          error = 'Server Resource Error';
          message = 'Server is temporarily unavailable. Please try again later.';
          break;

        // Class 57 - Operator Intervention
        case '57000':
        case '57014':
        case '57P01':
          status = HttpStatus.SERVICE_UNAVAILABLE;
          error = 'Database Operation Cancelled';
          message = 'Operation was cancelled. Please try again.';
          break;

        // Class 40 - Transaction Rollback
        case '40000':
        case '40001':
        case '40P01':
          status = HttpStatus.CONFLICT;
          error = 'Transaction Conflict';
          message = 'Operation conflict detected. Please try again.';
          break;

        // Default for unknown database errors
        default:
          status = HttpStatus.BAD_REQUEST;
          error = 'Database Error';
          message = 'Database operation failed. Please check your data and try again.';
          
          // Log the specific error code for debugging
          this.logger.error(
            `Unhandled database error code: ${dbError.code}`,
            dbError.stack,
          );
      }
      
      this.logger.error(
        `Database error [${dbError.code}]: ${dbError.message}`,
        dbError.stack,
      );
    } else if (exception instanceof Error) {
      // Handle other JavaScript errors
      this.logger.error(
        `Unexpected error: ${exception.message}`,
        exception.stack,
      );
      message = 'An unexpected error occurred. Please try again later.';
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`,
    );

    // Send sanitized error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
    });
  }
}
