import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import { GameplayService } from './gameplay.service';

@Controller('gameplay')
@UseGuards(AccessTokenGuard)
export class GameplayController {
  constructor(private readonly gameplayService: GameplayService) {}

  @Get('state')
  async getState(@Req() req: AuthenticatedRequest) {
    const [progression, village] = await Promise.all([
      this.gameplayService.getPlayerProgression(req.authUser!.id),
      this.gameplayService.getVillageState(req.authUser!.id),
    ]);

    return {
      status: 'ok',
      player: req.authUser,
      world: this.gameplayService.getWorldState(),
      progression,
      village,
    };
  }
}
