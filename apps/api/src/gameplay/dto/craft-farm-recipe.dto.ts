import { IsInt, IsString, Max, Min } from 'class-validator';

export class CraftFarmRecipeDto {
  @IsString()
  recipeKey!: string;

  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}
