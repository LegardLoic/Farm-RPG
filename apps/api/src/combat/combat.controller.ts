import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import { CombatService } from './combat.service';
import { CombatActionDto } from './dto/combat-action.dto';
import { ForfeitCombatDto } from './dto/forfeit-combat.dto';
import { StartCombatDto } from './dto/start-combat.dto';

@Controller('combat')
@UseGuards(AccessTokenGuard)
export class CombatController {
  constructor(private readonly combatService: CombatService) {}

  @Post('start')
  async start(@Req() req: AuthenticatedRequest, @Body() body?: StartCombatDto) {
    return {
      status: 'ok',
      ...await this.combatService.startCombat(req.authUser!.id, body ?? {}),
    };
  }

  @Get('current')
  async current(@Req() req: AuthenticatedRequest) {
    const encounter = await this.combatService.getCurrentCombat(req.authUser!.id);

    return {
      status: 'ok',
      encounter,
    };
  }

  @Get(':id')
  async getById(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return {
      status: 'ok',
      ...await this.combatService.getCombatById(req.authUser!.id, id),
    };
  }

  @Post(':id/action')
  async action(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CombatActionDto,
  ) {
    return {
      status: 'ok',
      ...await this.combatService.performAction(req.authUser!.id, id, body.action),
    };
  }

  @Post(':id/forfeit')
  async forfeit(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body?: ForfeitCombatDto,
  ) {
    return {
      status: 'ok',
      ...await this.combatService.forfeitCombat(req.authUser!.id, id, body ?? {}),
    };
  }
}
