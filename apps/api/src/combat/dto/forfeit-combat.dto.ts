import { IsOptional, IsString, Length } from 'class-validator';

export class ForfeitCombatDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  reason?: string;
}
