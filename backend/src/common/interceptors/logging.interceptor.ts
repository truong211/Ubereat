import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

interface LogData {
  method: string;
  url: string;
  body: unknown;
  params: unknown;
  query: unknown;
  userAgent: string;
  ip: string;
  timestamp: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const method = request.method;
    const url = request.url;
    const body = request.body as unknown;
    const params = request.params as unknown;
    const query = request.query as unknown;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip || request.connection.remoteAddress || 'unknown';

    const logData: LogData = {
      method,
      url,
      body: this.sanitizeBody(body),
      params,
      query,
      userAgent,
      ip,
      timestamp: new Date().toISOString(),
    };

    this.logger.log(`${method} ${url} - Started`, JSON.stringify(logData));

    return next.handle().pipe(
      tap({
        next: (responseBody: unknown) => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `${method} ${url} ${response.statusCode} - ${responseTime}ms`,
            JSON.stringify({
              ...logData,
              statusCode: response.statusCode,
              responseTime,
              responseSize: JSON.stringify(responseBody).length,
            }),
          );
        },
        error: (error: Error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `${method} ${url} ${response.statusCode} - ${responseTime}ms - Error: ${error.message}`,
            JSON.stringify({
              ...logData,
              statusCode: response.statusCode,
              responseTime,
              error: error.message,
              stack: error.stack,
            }),
          );
        },
      }),
    );
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = ['password', 'token', 'refreshToken', 'secret'];
    const sanitized = { ...body } as Record<string, unknown>;

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}
