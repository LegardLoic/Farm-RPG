import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertSaveSlotDto {
  @IsObject()
  snapshot!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;
}

