import { Body, Controller, NotFoundException, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import { DebugApplyLoadoutPresetDto } from './dto/debug-apply-loadout-preset.dto';
import { DebugCompleteQuestsDto } from './dto/debug-complete-quests.dto';
import { DebugGrantResourcesDto } from './dto/debug-grant-resources.dto';
import { DebugSetCombatStartOverrideDto } from './dto/debug-set-combat-start-override.dto';
import { DebugSetQuestStatusDto } from './dto/debug-set-quest-status.dto';
import { DebugSetTowerFloorDto } from './dto/debug-set-tower-floor.dto';
import { DebugSetWorldFlagsDto } from './dto/debug-set-world-flags.dto';
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

  @Post('complete-quests')
  async completeQuests(@Req() req: AuthenticatedRequest, @Body() body: DebugCompleteQuestsDto) {
    this.assertDebugEnabled();

    const quests = await this.debugAdminService.completeQuests(req.authUser!.id, body?.questKey);

    return {
      status: 'ok',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      quests,
    };
  }

  @Post('set-combat-start-override')
  async setCombatStartOverride(
    @Req() req: AuthenticatedRequest,
    @Body() body: DebugSetCombatStartOverrideDto,
  ) {
    this.assertDebugEnabled();

    const override = await this.debugAdminService.setCombatStartOverride(
      req.authUser!.id,
      body.enemyKey,
      body.isScriptedBossEncounter,
    );

    return {
      status: 'ok',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      override,
    };
  }

  @Post('clear-combat-start-override')
  async clearCombatStartOverride(@Req() req: AuthenticatedRequest) {
    this.assertDebugEnabled();

    const cleared = await this.debugAdminService.clearCombatStartOverride(req.authUser!.id);

    return {
      status: 'ok',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      cleared,
    };
  }

  @Post('apply-loadout-preset')
  async applyLoadoutPreset(@Req() req: AuthenticatedRequest, @Body() body: DebugApplyLoadoutPresetDto) {
    this.assertDebugEnabled();

    const loadout = await this.debugAdminService.applyLoadoutPreset(req.authUser!.id, body.presetKey);

    return {
      status: 'ok',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      loadout,
    };
  }

  @Post('set-world-flags')
  async setWorldFlags(@Req() req: AuthenticatedRequest, @Body() body: DebugSetWorldFlagsDto) {
    this.assertDebugEnabled();

    const worldFlags = await this.debugAdminService.setWorldFlags(req.authUser!.id, body);

    return {
      status: 'ok',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      worldFlags,
    };
  }

  @Post('set-quest-status')
  async setQuestStatus(@Req() req: AuthenticatedRequest, @Body() body: DebugSetQuestStatusDto) {
    this.assertDebugEnabled();

    const quest = await this.debugAdminService.setQuestStatus(req.authUser!.id, body.questKey, body.status);

    return {
      status: 'ok',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      quest,
    };
  }

  private assertDebugEnabled(): void {
    const environment = this.configService.get<string>('NODE_ENV', 'development');
    if (environment === 'production') {
      throw new NotFoundException();
    }
  }
}
