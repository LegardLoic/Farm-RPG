import { IsString } from 'class-validator';

export class PlantFarmPlotDto {
  @IsString()
  plotKey!: string;

  @IsString()
  seedItemKey!: string;
}
