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

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const { method, url, body, params, query } = request;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip || request.connection.remoteAddress;

    const logData = {
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
        next: (responseBody) => {
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
        error: (error) => {
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

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = ['password', 'token', 'refreshToken', 'secret'];
    const sanitized = { ...body };

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}
