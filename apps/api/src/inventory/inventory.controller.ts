import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import { InventoryAddDto } from './dto/inventory-add.dto';
import { InventoryUseDto } from './dto/inventory-use.dto';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseGuards(AccessTokenGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    return {
      status: 'ok',
      items: await this.inventoryService.listInventory(req.authUser!.id),
    };
  }

  @Post('add')
  async add(@Req() req: AuthenticatedRequest, @Body() body: InventoryAddDto) {
    return {
      status: 'ok',
      item: await this.inventoryService.addItem(req.authUser!.id, body.itemKey, body.quantity),
    };
  }

  @Post('use')
  async use(@Req() req: AuthenticatedRequest, @Body() body: InventoryUseDto) {
    return {
      status: 'ok',
      item: await this.inventoryService.useItem(req.authUser!.id, body.itemKey, body.quantity),
    };
  }
}

