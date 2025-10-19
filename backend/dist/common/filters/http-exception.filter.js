"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const resp = exceptionResponse;
                message = resp.message || message;
                error = resp.error || error;
            }
            else {
                message = exceptionResponse;
            }
        }
        else if (exception instanceof typeorm_1.QueryFailedError) {
            const dbError = exception;
            switch (dbError.code) {
                case '23000':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    error = 'Integrity Constraint Violation';
                    message = 'Data integrity violation. Please check your input.';
                    break;
                case '23001':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    error = 'Restrict Violation';
                    message = 'This record cannot be modified as it is referenced by other records.';
                    break;
                case '23502':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    error = 'Not Null Violation';
                    message = 'Required field is missing. Please fill all required fields.';
                    break;
                case '23503':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    error = 'Foreign Key Violation';
                    message = 'Referenced record not found. Please check related data.';
                    break;
                case '23505':
                    status = common_1.HttpStatus.CONFLICT;
                    error = 'Duplicate Entry';
                    message = 'This record already exists. Please use unique values.';
                    break;
                case '23514':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    error = 'Check Violation';
                    message = 'Data validation failed. Please check the constraints.';
                    break;
                case '22000':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    error = 'Data Exception';
                    message = 'Invalid data provided.';
                    break;
                case '22001':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    error = 'String Data Right Truncation';
                    message = 'Text is too long for the field. Please shorten your input.';
                    break;
                case '22003':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    error = 'Numeric Value Out of Range';
                    message = 'Number is too large or too small for this field.';
                    break;
                case '22007':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    error = 'Invalid Datetime Format';
                    message = 'Invalid date or time format provided.';
                    break;
                case '22008':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    error = 'Datetime Field Overflow';
                    message = 'Date or time value is out of valid range.';
                    break;
                case '22012':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    error = 'Division by Zero';
                    message = 'Mathematical operation error: Division by zero.';
                    break;
                case '22P02':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    error = 'Invalid Text Representation';
                    message = 'Invalid data format. Please check the data type.';
                    break;
                case '42501':
                    status = common_1.HttpStatus.FORBIDDEN;
                    error = 'Insufficient Privileges';
                    message = 'You do not have permission to perform this operation.';
                    break;
                case '42601':
                    status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
                    error = 'Syntax Error';
                    message = 'Database query error. Please contact support.';
                    break;
                case '42703':
                    status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
                    error = 'Undefined Column';
                    message = 'Database schema error. Please contact support.';
                    break;
                case '42P01':
                    status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
                    error = 'Undefined Table';
                    message = 'Database table not found. Please contact support.';
                    break;
                case '08000':
                case '08003':
                case '08006':
                    status = common_1.HttpStatus.SERVICE_UNAVAILABLE;
                    error = 'Database Connection Error';
                    message = 'Unable to connect to database. Please try again later.';
                    break;
                case '53000':
                case '53100':
                case '53200':
                case '53300':
                    status = common_1.HttpStatus.SERVICE_UNAVAILABLE;
                    error = 'Server Resource Error';
                    message = 'Server is temporarily unavailable. Please try again later.';
                    break;
                case '57000':
                case '57014':
                case '57P01':
                    status = common_1.HttpStatus.SERVICE_UNAVAILABLE;
                    error = 'Database Operation Cancelled';
                    message = 'Operation was cancelled. Please try again.';
                    break;
                case '40000':
                case '40001':
                case '40P01':
                    status = common_1.HttpStatus.CONFLICT;
                    error = 'Transaction Conflict';
                    message = 'Operation conflict detected. Please try again.';
                    break;
                default:
                    status = common_1.HttpStatus.BAD_REQUEST;
                    error = 'Database Error';
                    message = 'Database operation failed. Please check your data and try again.';
                    this.logger.error(`Unhandled database error code: ${dbError.code}`, dbError.stack);
            }
            this.logger.error(`Database error [${dbError.code}]: ${dbError.message}`, dbError.stack);
        }
        else if (exception instanceof Error) {
            this.logger.error(`Unexpected error: ${exception.message}`, exception.stack);
            message = 'An unexpected error occurred. Please try again later.';
        }
        this.logger.error(`${request.method} ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`);
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            error,
            message,
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map