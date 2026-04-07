import { IsString, MaxLength } from 'class-validator';

import { FarmTilePositionDto } from './farm-tile-position.dto';

export class HarvestFarmTileDto extends FarmTilePositionDto {
  @IsString()
  @MaxLength(128)
  toolItemKey!: string;
}
