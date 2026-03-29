import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class DebugSetCombatStartOverrideDto {
  @IsString()
  @Length(1, 64)
  enemyKey!: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isScriptedBossEncounter = false;
}
