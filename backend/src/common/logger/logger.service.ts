import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  LOG = 2,
  DEBUG = 3,
  VERBOSE = 4,
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

@Injectable()
export class CustomLoggerService implements NestLoggerService {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const ctx = this.context || 'Application';
    
    const baseLog = {
      timestamp,
      level,
      context: ctx,
      message,
    };

    if (context) {
      return JSON.stringify({ ...baseLog, ...context });
    }

    return JSON.stringify(baseLog);
  }

  log(message: string, context?: LogContext) {
    console.log(this.formatMessage('LOG', message, context));
  }

  error(message: string, context?: LogContext) {
    console.error(this.formatMessage('ERROR', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('WARN', message, context));
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }

  verbose(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('VERBOSE', message, context));
    }
  }

  // Structured logging methods for specific use cases
  logUserAction(userId: string, action: string, details?: any) {
    this.log(`User action: ${action}`, {
      userId,
      action,
      details,
    });
  }

  logDatabaseOperation(operation: string, table: string, duration?: number, error?: any) {
    if (error) {
      this.error(`Database ${operation} failed on ${table}`, {
        operation,
        table,
        duration,
        error: error.message,
      });
    } else {
      this.log(`Database ${operation} on ${table}`, {
        operation,
        table,
        duration,
      });
    }
  }

  logAPICall(method: string, url: string, statusCode: number, duration: number, userId?: string) {
    this.log(`API ${method} ${url}`, {
      method,
      url,
      statusCode,
      duration,
      userId,
    });
  }

  logSecurityEvent(event: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium') {
    this.warn(`Security event: ${event}`, {
      event,
      severity,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  logBusinessEvent(event: string, details: any) {
    this.log(`Business event: ${event}`, {
      event,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}