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
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      
      if (typeof errorResponse === 'string') {
        message = errorResponse;
        error = exception.constructor.name;
      } else if (typeof errorResponse === 'object') {
        message = (errorResponse as any).message || exception.message;
        error = (errorResponse as any).error || exception.constructor.name;
        details = (errorResponse as any).details || null;
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database query failed';
      error = 'QueryFailedError';
      
      // Handle specific database errors
      if (exception.message.includes('duplicate key')) {
        message = 'Resource already exists';
        error = 'DuplicateError';
      } else if (exception.message.includes('foreign key constraint')) {
        message = 'Referenced resource not found';
        error = 'ReferenceError';
      }
      
      // Don't expose sensitive database information in production
      if (process.env.NODE_ENV !== 'production') {
        details = {
          query: exception.query,
          parameters: exception.parameters,
        };
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.constructor.name;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      {
        error: errorResponse,
        user: (request as any).user?.id || 'anonymous',
        ip: request.ip,
        userAgent: request.get('User-Agent'),
      },
    );

    response.status(status).json(errorResponse);
  }
}