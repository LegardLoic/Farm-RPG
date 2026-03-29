import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UnauthorizedException, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import { UpsertSaveSlotDto } from './dto/upsert-save-slot.dto';
import { SavesService } from './saves.service';

@Controller('saves')
@UseGuards(AccessTokenGuard)
export class SavesController {
  constructor(private readonly savesService: SavesService) {}

  @Get()
  async listSaves(@Req() req: AuthenticatedRequest) {
    const userId = this.getUserId(req);
    const slots = await this.savesService.listSlots(userId);

    return {
      status: 'ok',
      slots,
    };
  }

  @Get('auto/latest')
  async getLatestAutoSave(@Req() req: AuthenticatedRequest) {
    const userId = this.getUserId(req);
    const autosave = await this.savesService.getAutoSave(userId);

    return {
      status: 'ok',
      autosave,
    };
  }

  @Post('auto/restore/:slot')
  async restoreAutoSaveToSlot(@Req() req: AuthenticatedRequest, @Param('slot', ParseIntPipe) slot: number) {
    const userId = this.getUserId(req);
    const save = await this.savesService.restoreAutoSaveToSlot(userId, slot);

    return {
      status: 'ok',
      save,
    };
  }

  @Post(':slot/capture')
  async captureSaveSlot(@Req() req: AuthenticatedRequest, @Param('slot', ParseIntPipe) slot: number) {
    const userId = this.getUserId(req);
    const save = await this.savesService.captureSlotFromLiveState(userId, slot);

    return {
      status: 'ok',
      save,
    };
  }

  @Post(':slot/load')
  async loadSaveSlot(@Req() req: AuthenticatedRequest, @Param('slot', ParseIntPipe) slot: number) {
    const userId = this.getUserId(req);
    const save = await this.savesService.loadSlotToLiveState(userId, slot);

    return {
      status: 'ok',
      save,
    };
  }

  @Get(':slot')
  async getSave(@Req() req: AuthenticatedRequest, @Param('slot', ParseIntPipe) slot: number) {
    const userId = this.getUserId(req);
    const save = await this.savesService.getSlot(userId, slot);

    return {
      status: 'ok',
      save,
    };
  }

  @Put(':slot')
  async upsertSave(
    @Req() req: AuthenticatedRequest,
    @Param('slot', ParseIntPipe) slot: number,
    @Body() body: UpsertSaveSlotDto,
  ) {
    const userId = this.getUserId(req);
    const save = await this.savesService.upsertSlot(userId, slot, body);

    return {
      status: 'ok',
      save,
    };
  }

  @Delete(':slot')
  async deleteSave(@Req() req: AuthenticatedRequest, @Param('slot', ParseIntPipe) slot: number) {
    const userId = this.getUserId(req);
    const result = await this.savesService.deleteSlot(userId, slot);

    return {
      status: 'ok',
      ...result,
    };
  }

  private getUserId(req: AuthenticatedRequest): string {
    const userId = req.authUser?.id;
    if (!userId) {
      throw new UnauthorizedException('Authenticated user missing');
    }

    return userId;
  }
}
