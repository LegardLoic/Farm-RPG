import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, Max, Min, MinLength, ValidateNested } from 'class-validator';

export class DebugGrantItemDto {
  @IsString()
  @MinLength(1)
  itemKey!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9999)
  quantity!: number;
}

export class DebugGrantResourcesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5_000_000)
  experience = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5_000_000)
  gold = 0;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => DebugGrantItemDto)
  items: DebugGrantItemDto[] = [];
}
