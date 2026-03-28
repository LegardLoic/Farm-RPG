import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import { EquipmentEquipDto } from './dto/equipment-equip.dto';
import { EquipmentUnequipDto } from './dto/equipment-unequip.dto';
import { EquipmentService } from './equipment.service';

@Controller('equipment')
@UseGuards(AccessTokenGuard)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    return {
      status: 'ok',
      equipment: await this.equipmentService.listEquipment(req.authUser!.id),
    };
  }

  @Post('equip')
  async equip(@Req() req: AuthenticatedRequest, @Body() body: EquipmentEquipDto) {
    return {
      status: 'ok',
      equipment: await this.equipmentService.equipItem(req.authUser!.id, body.slot, body.itemKey),
    };
  }

  @Post('unequip')
  async unequip(@Req() req: AuthenticatedRequest, @Body() body: EquipmentUnequipDto) {
    return {
      status: 'ok',
      equipment: await this.equipmentService.unequipItem(req.authUser!.id, body.slot),
    };
  }
}

