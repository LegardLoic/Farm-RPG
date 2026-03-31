import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import { GameplayService } from './gameplay.service';
import { TowerService } from '../tower/tower.service';

@Controller('gameplay')
@UseGuards(AccessTokenGuard)
export class GameplayController {
  constructor(
    private readonly gameplayService: GameplayService,
    private readonly towerService: TowerService,
  ) {}

  @Get('state')
  async getState(@Req() req: AuthenticatedRequest) {
    const [progression, village, tower, world, intro] = await Promise.all([
      this.gameplayService.getPlayerProgression(req.authUser!.id),
      this.gameplayService.getVillageState(req.authUser!.id),
      this.towerService.getState(req.authUser!.id),
      this.gameplayService.getWorldState(req.authUser!.id),
      this.gameplayService.getIntroState(req.authUser!.id),
    ]);

    return {
      status: 'ok',
      player: req.authUser,
      world,
      progression,
      village,
      tower,
      intro,
    };
  }

  @Post('intro/advance')
  async advanceIntroState(@Req() req: AuthenticatedRequest) {
    const intro = await this.gameplayService.advanceIntroState(req.authUser!.id);
    return {
      status: 'ok',
      intro,
    };
  }
}
