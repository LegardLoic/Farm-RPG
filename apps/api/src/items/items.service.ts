import { Injectable } from '@nestjs/common';

import { getGameItemDefinition, listGameItemDefinitions } from './items.catalog';

@Injectable()
export class ItemsService {
  listCatalog() {
    return listGameItemDefinitions();
  }

  getByKey(itemKey: string) {
    return getGameItemDefinition(itemKey);
  }
}

