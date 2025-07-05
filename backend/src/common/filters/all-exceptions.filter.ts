import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, error, validationErrors } =
      this.getErrorResponse(exception);

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
      ...(validationErrors && { validationErrors }),
    };

    this.logError(exception, request, errorResponse);

    response.status(status).json(errorResponse);
  }

  private getErrorResponse(exception: unknown): {
    status: number;
    message: string;
    error: string;
    validationErrors?: string[];
  } {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';
    let validationErrors: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'object' && response !== null) {
        const responseObj = response as Record<string, unknown>;
        message = (responseObj.message as string) || exception.message;
        error = (responseObj.error as string) || exception.name;
        validationErrors = Array.isArray(responseObj.message)
          ? (responseObj.message as string[])
          : undefined;
      } else {
        message = response;
        error = exception.name;
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database query failed';
      error = 'QueryFailedError';

      // Handle specific database errors
      if (exception.message.includes('duplicate key')) {
        message = 'Resource already exists';
        error = 'DuplicateResourceError';
        status = HttpStatus.CONFLICT;
      } else if (
        exception.message.includes('violates foreign key constraint')
      ) {
        message = 'Invalid reference to related resource';
        error = 'ForeignKeyConstraintError';
      }
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
      error = 'EntityNotFoundError';
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    return { status, message, error, validationErrors };
  }

  private logError(
    exception: unknown,
    request: Request,
    errorResponse: {
      success: boolean;
      statusCode: number;
      timestamp: string;
      path: string;
      method: string;
      message: string;
      error: string;
      validationErrors?: string[];
    },
  ): void {
    const { statusCode, message } = errorResponse;
    const method = request.method;
    const url = request.url;
    const body = request.body as unknown;
    const params = request.params as unknown;
    const query = request.query as unknown;

    const logMessage = `${method} ${url} ${statusCode} - ${message}`;
    const logContext = {
      exception:
        exception instanceof Error ? exception.stack : String(exception),
      request: {
        method,
        url,
        body,
        params,
        query,
        headers: request.headers,
      },
      response: errorResponse,
    };

    if (statusCode >= 500) {
      this.logger.error(logMessage, JSON.stringify(logContext, null, 2));
    } else if (statusCode >= 400) {
      this.logger.warn(logMessage, JSON.stringify(logContext, null, 2));
    } else {
      this.logger.log(logMessage);
    }
  }
}
