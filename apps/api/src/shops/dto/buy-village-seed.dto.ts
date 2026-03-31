import { IsInt, IsString, Max, Min } from 'class-validator';

export class BuyVillageSeedDto {
  @IsString()
  offerKey!: string;

  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}
