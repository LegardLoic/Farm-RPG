import { IsOptional, IsString, Length } from 'class-validator';

export class StartCombatDto {
  @IsOptional()
  @IsString()
  @Length(1, 64)
  enemyKey?: string;
}

