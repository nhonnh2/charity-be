import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from '../exceptions/business.exception';
import { CommonErrorCode } from '../../shared/enums/error-codes.enum';

/**
 * Global exception filter that formats all errors with consistent structure
 * 
 * Response format:
 * {
 *   success: false,
 *   statusCode: number,
 *   error_code: string,      // For client-side multi-language mapping
 *   message: string,          // For developer debugging
 *   timestamp: string,
 *   path: string,
 *   method: string,
 *   errors?: any[]           // For validation errors
 * }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let errorCode: string;
    let message: string;
    let errors: any[] | undefined;

    // Handle BusinessException (our custom exceptions with error codes)
    if (exception instanceof BusinessException) {
      status = exception.getStatus();
      errorCode = exception.getErrorCode();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
      } else {
        message = exception.message;
      }
    }
    // Handle NestJS validation errors
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Handle class-validator validation errors
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const responseObj = exceptionResponse as any;
        
        // If it's a validation error with multiple messages
        if (Array.isArray(responseObj.message)) {
          errorCode = CommonErrorCode.VALIDATION_ERROR;
          message = 'Validation failed';
          errors = responseObj.message;
        } else {
          // Map standard HTTP exceptions to error codes
          errorCode = this.mapHttpStatusToErrorCode(status);
          message = responseObj.message || exception.message;
        }
      } else {
        errorCode = this.mapHttpStatusToErrorCode(status);
        message = exception.message;
      }
    }
    // Handle unexpected errors
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = CommonErrorCode.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';

      // Log unexpected errors for debugging
      this.logger.error('Unexpected error occurred:', exception);
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      error_code: errorCode,
      message,
      ...(errors && { errors }), // Include validation errors if present
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Log errors (except common client errors like 404, 400)
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${status} - ${errorCode}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `[${request.method}] ${request.url} - ${status} - ${errorCode}: ${message}`,
      );
    }

    response.status(status).json(errorResponse);
  }

  /**
   * Map standard HTTP status codes to error codes
   * This is a fallback for exceptions that don't use BusinessException
   */
  private mapHttpStatusToErrorCode(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return CommonErrorCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return CommonErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return CommonErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return CommonErrorCode.NOT_FOUND;
      case HttpStatus.REQUEST_TIMEOUT:
        return CommonErrorCode.TIMEOUT;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return CommonErrorCode.INTERNAL_SERVER_ERROR;
      default:
        return CommonErrorCode.INTERNAL_SERVER_ERROR;
    }
  }
} 