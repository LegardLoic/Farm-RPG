import { IsIn, IsString, MinLength } from 'class-validator';

import { EQUIPMENT_SLOTS } from '../equipment.constants';

export class EquipmentEquipDto {
  @IsIn(EQUIPMENT_SLOTS)
  slot!: (typeof EQUIPMENT_SLOTS)[number];

  @IsString()
  @MinLength(1)
  itemKey!: string;
}
