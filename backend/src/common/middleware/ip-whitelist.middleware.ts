import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IpWhitelistMiddleware implements NestMiddleware {
  private readonly whitelist: string[];

  constructor(private configService: ConfigService) {
    // Get IP whitelist from environment variables
    const whitelistStr = this.configService.get<string>('IP_WHITELIST', '');
    this.whitelist = whitelistStr.split(',').filter(ip => ip.trim().length > 0);
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Skip if no whitelist is configured
    if (this.whitelist.length === 0) {
      return next();
    }

    const clientIp = this.getClientIp(req);
    
    if (!this.isIpWhitelisted(clientIp)) {
      throw new ForbiddenException(`Access denied for IP: ${clientIp}`);
    }

    next();
  }

  private getClientIp(req: Request): string {
    return (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }

  private isIpWhitelisted(ip: string): boolean {
    // Handle IPv6 mapped IPv4 addresses
    const normalizedIp = ip.replace(/^::ffff:/, '');
    
    return this.whitelist.some(whitelistedIp => {
      // Exact match
      if (whitelistedIp === normalizedIp) return true;
      
      // CIDR range match (basic implementation)
      if (whitelistedIp.includes('/')) {
        return this.isIpInCidr(normalizedIp, whitelistedIp);
      }
      
      // Wildcard match
      if (whitelistedIp.includes('*')) {
        const pattern = whitelistedIp.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(normalizedIp);
      }
      
      return false;
    });
  }

  private isIpInCidr(ip: string, cidr: string): boolean {
    const [range, prefixLength] = cidr.split('/');
    const prefixLen = parseInt(prefixLength, 10);
    
    if (isNaN(prefixLen) || prefixLen < 0 || prefixLen > 32) {
      return false;
    }

    const ipParts = ip.split('.').map(part => parseInt(part, 10));
    const rangeParts = range.split('.').map(part => parseInt(part, 10));
    
    if (ipParts.length !== 4 || rangeParts.length !== 4) {
      return false;
    }

    const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
    const rangeNum = (rangeParts[0] << 24) | (rangeParts[1] << 16) | (rangeParts[2] << 8) | rangeParts[3];
    const mask = (-1 << (32 - prefixLen)) >>> 0;

    return (ipNum & mask) === (rangeNum & mask);
  }
}