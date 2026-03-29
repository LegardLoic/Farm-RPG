import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class DebugSetTowerFloorDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  floor!: number;
}
