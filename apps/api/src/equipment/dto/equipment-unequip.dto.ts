import { IsIn } from 'class-validator';

import { EQUIPMENT_SLOTS } from '../equipment.constants';

export class EquipmentUnequipDto {
  @IsIn(EQUIPMENT_SLOTS)
  slot!: (typeof EQUIPMENT_SLOTS)[number];
}

