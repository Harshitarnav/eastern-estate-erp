"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger(AllExceptionsFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof common_1.HttpException
            ? exception.getResponse()
            : 'Internal server error';
        this.logger.error(`${request.method} ${request.url}`, exception instanceof Error ? exception.stack : exception);
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
    getErrorMessage(message, status) {
        const errorMessages = {
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
    getValidationErrors(message) {
        if (typeof message === 'object' && Array.isArray(message.message)) {
            return message.message.map((msg) => {
                if (typeof msg === 'string') {
                    return msg;
                }
                if (typeof msg === 'object' && msg.constraints) {
                    return Object.values(msg.constraints).join('. ');
                }
                return String(msg);
            }).filter(Boolean);
        }
        return undefined;
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.HttpExceptionFilter = AllExceptionsFilter;
exports.HttpExceptionFilter = exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=http-exception.filter.js.map