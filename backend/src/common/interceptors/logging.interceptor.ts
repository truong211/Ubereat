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
          const responseSize = this.getResponseSize(responseBody);
          this.logger.log(
            `${method} ${url} ${response.statusCode} - ${responseTime}ms`,
            JSON.stringify({
              ...logData,
              statusCode: response.statusCode,
              responseTime,
              responseSize,
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

  private getResponseSize(responseBody: unknown): number {
    try {
      if (responseBody === null || responseBody === undefined) {
        return 0;
      }

      // Handle primitive types
      if (typeof responseBody !== 'object') {
        if (responseBody === null || responseBody === undefined) {
          return 0;
        }
        // Safe string conversion for primitives
        if (typeof responseBody === 'string') {
          return responseBody.length;
        }
        if (
          typeof responseBody === 'number' ||
          typeof responseBody === 'boolean'
        ) {
          return responseBody.toString().length;
        }
        return 0; // Fallback for other primitive types
      }

      // Use a safe JSON stringifier that handles circular references
      const jsonString = JSON.stringify(
        responseBody,
        this.getCircularReplacer(),
      );
      return jsonString.length;
    } catch {
      // Fallback if JSON.stringify still fails - return a constant safe size
      return 50; // Return a reasonable default size for unknown objects
    }
  }

  private getCircularReplacer(): (key: string, value: unknown) => unknown {
    const seen = new WeakSet<object>();
    return (key: string, value: unknown): unknown => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    };
  }
}
