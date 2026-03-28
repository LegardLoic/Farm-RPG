import { IsIn } from 'class-validator';

import { COMBAT_ACTIONS } from '../combat.constants';
import type { CombatActionName } from '../combat.types';

export class CombatActionDto {
  @IsIn(COMBAT_ACTIONS)
  action!: CombatActionName;
}

