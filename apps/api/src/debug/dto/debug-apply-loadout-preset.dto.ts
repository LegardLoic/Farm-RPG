import { IsIn } from 'class-validator';

import { DEBUG_LOADOUT_PRESET_KEYS } from '../debug-loadout.constants';

export class DebugApplyLoadoutPresetDto {
  @IsIn(DEBUG_LOADOUT_PRESET_KEYS)
  presetKey!: string;
}
