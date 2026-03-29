import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import { DatabaseService } from '../database/database.service';
import { QuestsService } from './quests.service';

@Controller('quests')
@UseGuards(AccessTokenGuard)
export class QuestsController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly questsService: QuestsService,
  ) {}

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    const quests = await this.databaseService.withTransaction((tx) =>
      this.questsService.listQuests(tx, req.authUser!.id),
    );

    return {
      status: 'ok',
      quests,
    };
  }

  @Post(':questKey/claim')
  async claim(@Req() req: AuthenticatedRequest, @Param('questKey') questKey: string) {
    const quest = await this.databaseService.withTransaction((tx) =>
      this.questsService.claimQuest(tx, req.authUser!.id, questKey),
    );

    return {
      status: 'ok',
      quest,
    };
  }
}
