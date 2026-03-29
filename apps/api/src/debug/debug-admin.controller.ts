import { Controller, NotFoundException, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import { DebugAdminService } from './debug-admin.service';

@Controller('debug/admin')
@UseGuards(AccessTokenGuard)
export class DebugAdminController {
  constructor(
    private readonly configService: ConfigService,
    private readonly debugAdminService: DebugAdminService,
  ) {}

  @Post('reset-progression')
  async resetProgression(@Req() req: AuthenticatedRequest) {
    this.assertDebugEnabled();

    const reset = await this.debugAdminService.resetProgression(req.authUser!.id);

    return {
      status: 'ok',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      reset,
    };
  }

  private assertDebugEnabled(): void {
    const environment = this.configService.get<string>('NODE_ENV', 'development');
    if (environment === 'production') {
      throw new NotFoundException();
    }
  }
}
