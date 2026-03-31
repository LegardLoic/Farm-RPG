import { IsString } from 'class-validator';

export class HarvestFarmPlotDto {
  @IsString()
  plotKey!: string;
}
