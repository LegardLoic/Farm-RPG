import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import { TowerService } from './tower.service';

@Controller('tower')
@UseGuards(AccessTokenGuard)
export class TowerController {
  constructor(private readonly towerService: TowerService) {}

  @Get('state')
  async getState(@Req() req: AuthenticatedRequest) {
    return {
      status: 'ok',
      tower: await this.towerService.getState(req.authUser!.id),
    };
  }
}
