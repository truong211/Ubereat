import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

const defaultOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

// In-memory store for rate limiting (use Redis in production)
const store = new Map<string, { count: number; resetTime: number }>();

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    // Get rate limit options from decorator or use defaults
    const options = this.reflector.get<RateLimitOptions>('rateLimit', context.getHandler()) || 
                   this.reflector.get<RateLimitOptions>('rateLimit', context.getClass()) ||
                   defaultOptions;

    const key = this.generateKey(request);
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // Clean up old entries
    this.cleanupExpiredEntries(windowStart);

    let record = store.get(key);

    if (!record || record.resetTime <= now) {
      record = {
        count: 0,
        resetTime: now + options.windowMs,
      };
    }

    record.count++;
    store.set(key, record);

    const remaining = Math.max(0, options.max - record.count);
    const resetTime = new Date(record.resetTime);

    // Set rate limit headers
    response.setHeader('X-RateLimit-Limit', options.max);
    response.setHeader('X-RateLimit-Remaining', remaining);
    response.setHeader('X-RateLimit-Reset', resetTime.toISOString());

    if (record.count > options.max) {
      response.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: options.message,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private generateKey(request: Request): string {
    // Use IP address as the key (can be enhanced with user ID for authenticated requests)
    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    const userId = (request as any).user?.id;
    return userId ? `user:${userId}` : `ip:${ip}`;
  }

  private cleanupExpiredEntries(windowStart: number): void {
    for (const [key, record] of store.entries()) {
      if (record.resetTime <= windowStart) {
        store.delete(key);
      }
    }
  }
}

// Decorator to set custom rate limit options
export const RateLimit = (options: Partial<RateLimitOptions>) =>
  Reflector.createDecorator<RateLimitOptions>({ ...defaultOptions, ...options });