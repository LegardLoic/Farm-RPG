import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import { GameplayService } from './gameplay.service';
import { TowerService } from '../tower/tower.service';
import { CraftFarmRecipeDto } from './dto/craft-farm-recipe.dto';
import { HarvestFarmPlotDto } from './dto/harvest-farm-plot.dto';
import { InteractVillageNpcDto } from './dto/interact-village-npc.dto';
import { PlantFarmPlotDto } from './dto/plant-farm-plot.dto';
import { WaterFarmPlotDto } from './dto/water-farm-plot.dto';

@Controller('gameplay')
@UseGuards(AccessTokenGuard)
export class GameplayController {
  constructor(
    private readonly gameplayService: GameplayService,
    private readonly towerService: TowerService,
  ) {}

  @Get('state')
  async getState(@Req() req: AuthenticatedRequest) {
    const [progression, village, tower, world, intro, loop] = await Promise.all([
      this.gameplayService.getPlayerProgression(req.authUser!.id),
      this.gameplayService.getVillageState(req.authUser!.id),
      this.towerService.getState(req.authUser!.id),
      this.gameplayService.getWorldState(req.authUser!.id),
      this.gameplayService.getIntroState(req.authUser!.id),
      this.gameplayService.getLoopState(req.authUser!.id),
    ]);
    const [farm, crafting] = await Promise.all([
      this.gameplayService.getFarmState(req.authUser!.id, world.day),
      this.gameplayService.getFarmCraftingState(req.authUser!.id),
    ]);

    return {
      status: 'ok',
      player: req.authUser,
      world,
      progression,
      village,
      tower,
      intro,
      loop,
      farm,
      crafting,
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

  @Post('village/npc/interact')
  async interactVillageNpc(@Req() req: AuthenticatedRequest, @Body() body: InteractVillageNpcDto) {
    const result = await this.gameplayService.interactVillageNpc(req.authUser!.id, body.npcKey);
    return {
      status: 'ok',
      ...result,
    };
  }

  @Post('combat/prepare')
  async prepareCombatLoadout(@Req() req: AuthenticatedRequest) {
    const result = await this.gameplayService.prepareCombatLoadout(req.authUser!.id);
    return {
      status: 'ok',
      ...result,
    };
  }

  @Post('sleep')
  async sleep(@Req() req: AuthenticatedRequest) {
    const result = await this.gameplayService.sleep(req.authUser!.id);
    return {
      status: 'ok',
      ...result,
    };
  }

  @Get('crafting')
  async getFarmCrafting(@Req() req: AuthenticatedRequest) {
    return {
      status: 'ok',
      crafting: await this.gameplayService.getFarmCraftingState(req.authUser!.id),
    };
  }

  @Post('crafting/craft')
  async craftFarmRecipe(@Req() req: AuthenticatedRequest, @Body() body: CraftFarmRecipeDto) {
    const result = await this.gameplayService.craftFarmRecipe(req.authUser!.id, body.recipeKey, body.quantity);
    return {
      status: 'ok',
      ...result,
    };
  }

  @Post('farm/plant')
  async plantFarmPlot(@Req() req: AuthenticatedRequest, @Body() body: PlantFarmPlotDto) {
    const result = await this.gameplayService.plantFarmPlot(
      req.authUser!.id,
      body.plotKey,
      body.seedItemKey,
    );
    return {
      status: 'ok',
      ...result,
    };
  }

  @Post('farm/water')
  async waterFarmPlot(@Req() req: AuthenticatedRequest, @Body() body: WaterFarmPlotDto) {
    const result = await this.gameplayService.waterFarmPlot(req.authUser!.id, body.plotKey);
    return {
      status: 'ok',
      ...result,
    };
  }

  @Post('farm/harvest')
  async harvestFarmPlot(@Req() req: AuthenticatedRequest, @Body() body: HarvestFarmPlotDto) {
    const result = await this.gameplayService.harvestFarmPlot(req.authUser!.id, body.plotKey);
    return {
      status: 'ok',
      ...result,
    };
  }
}
