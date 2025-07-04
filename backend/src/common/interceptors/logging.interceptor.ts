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
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // Log request
    this.logger.log(
      `📥 ${method} ${url} - ${ip} - ${userAgent}`,
      {
        method,
        url,
        ip,
        userAgent,
        userId: (request as any).user?.id || null,
        timestamp: new Date().toISOString(),
      },
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;
          
          this.logger.log(
            `📤 ${method} ${url} - ${statusCode} - ${duration}ms`,
            {
              method,
              url,
              statusCode,
              duration,
              responseSize: JSON.stringify(data).length,
              timestamp: new Date().toISOString(),
            },
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;
          
          this.logger.error(
            `❌ ${method} ${url} - ${statusCode} - ${duration}ms`,
            {
              method,
              url,
              statusCode,
              duration,
              error: error.message,
              stack: error.stack,
              timestamp: new Date().toISOString(),
            },
          );
        },
      }),
    );
  }
}