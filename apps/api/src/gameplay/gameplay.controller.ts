import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';

@Controller('gameplay')
@UseGuards(AccessTokenGuard)
export class GameplayController {
  @Get('state')
  getState(@Req() req: AuthenticatedRequest) {
    return {
      status: 'ok',
      message: 'Protected gameplay route',
      player: req.authUser,
      world: {
        zone: 'Ferme',
        day: 1,
      },
    };
  }
}

