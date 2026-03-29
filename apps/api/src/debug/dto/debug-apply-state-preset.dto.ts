import { IsIn, IsString, MinLength } from 'class-validator';

import { DEBUG_STATE_PRESET_KEYS } from '../debug-admin.constants';

export class DebugApplyStatePresetDto {
  @IsString()
  @MinLength(1)
  @IsIn(DEBUG_STATE_PRESET_KEYS)
  presetKey!: string;
}
