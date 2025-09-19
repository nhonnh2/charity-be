import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}
  getInfo(): object {
    return {
      name: 'Charity API',
      version: '1.0.0',
      description: 'API for charity management system',
      environment: this.configService.get<string>('NODE_ENV') || 'development',
    };
  }

  getHealth(): object {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
} 