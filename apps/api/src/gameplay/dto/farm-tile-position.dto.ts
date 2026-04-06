import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class FarmTilePositionDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  tileX!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  tileY!: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sceneKey?: string;
}
