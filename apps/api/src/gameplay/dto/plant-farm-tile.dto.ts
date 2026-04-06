import { IsString, MaxLength } from 'class-validator';

import { FarmTilePositionDto } from './farm-tile-position.dto';

export class PlantFarmTileDto extends FarmTilePositionDto {
  @IsString()
  @MaxLength(128)
  seedItemKey!: string;
}
