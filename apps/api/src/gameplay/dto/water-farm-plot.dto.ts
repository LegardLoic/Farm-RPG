import { IsString } from 'class-validator';

export class WaterFarmPlotDto {
  @IsString()
  plotKey!: string;
}
