import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';

@Controller('saves')
@UseGuards(AccessTokenGuard)
export class SavesController {
  @Get()
  listSaves(@Req() req: AuthenticatedRequest) {
    return {
      status: 'ok',
      message: 'Protected saves route',
      owner: req.authUser,
      slots: [
        { slot: 1, exists: false },
        { slot: 2, exists: false },
        { slot: 3, exists: false },
      ],
    };
  }
}

