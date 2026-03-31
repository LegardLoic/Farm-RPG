import { Transform } from 'class-transformer';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

import {
  HERO_APPEARANCE_KEYS,
  HERO_NAME_MAX_LENGTH,
  HERO_NAME_MIN_LENGTH,
  type HeroAppearanceKey,
} from '../profile.constants';

export class UpsertPlayerProfileDto {
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MinLength(HERO_NAME_MIN_LENGTH)
  @MaxLength(HERO_NAME_MAX_LENGTH)
  heroName!: string;

  @IsIn(HERO_APPEARANCE_KEYS)
  appearanceKey!: HeroAppearanceKey;
}
