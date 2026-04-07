import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('catalog')
  listCatalog() {
    const items = this.itemsService.listCatalog();
    return {
      status: 'ok',
      total: items.length,
      items,
    };
  }

  @Get('catalog/:itemKey')
  getCatalogEntry(@Param('itemKey') itemKey: string) {
    const item = this.itemsService.getByKey(itemKey);
    if (!item) {
      throw new NotFoundException(`Unknown item key: ${itemKey}`);
    }

    return {
      status: 'ok',
      item,
    };
  }
}

