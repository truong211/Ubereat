import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

interface RequestWithIps extends Record<string, any> {
  ips: string[];
  ip: string;
}

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    const requestWithIps = req as RequestWithIps;
    const ip = requestWithIps.ips?.length
      ? requestWithIps.ips[0]
      : requestWithIps.ip;
    return Promise.resolve(ip || 'unknown');
  }
}
