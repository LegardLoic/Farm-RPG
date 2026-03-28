import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'rpg-farm-api',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
