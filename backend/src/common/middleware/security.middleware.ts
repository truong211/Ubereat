import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
const compression = require('compression');

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Apply security headers with helmet
    const helmetMiddleware = helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://cdnjs.cloudflare.com',
          ],
          scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    });

    helmetMiddleware(req, res, (helmetErr?: any) => {
      if (helmetErr) {
        return next(helmetErr);
      }

      // Apply compression after helmet
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      const compressionMiddleware = compression();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      compressionMiddleware(req, res, (compressionErr?: any) => {
        if (compressionErr) {
          return next(compressionErr);
        }

        // Add custom security headers
        res.setHeader('X-Request-ID', this.generateRequestId());
        res.setHeader('X-Response-Time', Date.now().toString());

        // Remove server signature
        res.removeHeader('X-Powered-By');

        next();
      });
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
