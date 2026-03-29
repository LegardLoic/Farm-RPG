import { Body, Controller, NotFoundException, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import { DebugGrantResourcesDto } from './dto/debug-grant-resources.dto';
import { DebugSetTowerFloorDto } from './dto/debug-set-tower-floor.dto';
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

  @Post('grant-resources')
  async grantResources(@Req() req: AuthenticatedRequest, @Body() body: DebugGrantResourcesDto) {
    this.assertDebugEnabled();

    const grant = await this.debugAdminService.grantResources(req.authUser!.id, body);

    return {
      status: 'ok',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      grant,
    };
  }

  @Post('set-tower-floor')
  async setTowerFloor(@Req() req: AuthenticatedRequest, @Body() body: DebugSetTowerFloorDto) {
    this.assertDebugEnabled();

    const tower = await this.debugAdminService.setTowerFloor(req.authUser!.id, body.floor);

    return {
      status: 'ok',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      tower,
    };
  }

  private assertDebugEnabled(): void {
    const environment = this.configService.get<string>('NODE_ENV', 'development');
    if (environment === 'production') {
      throw new NotFoundException();
    }
  }
}
