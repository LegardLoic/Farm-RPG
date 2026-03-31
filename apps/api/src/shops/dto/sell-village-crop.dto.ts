import { IsInt, IsString, Max, Min } from 'class-validator';

export class SellVillageCropDto {
  @IsString()
  itemKey!: string;

  @IsInt()
  @Min(1)
  @Max(999)
  quantity!: number;
}
