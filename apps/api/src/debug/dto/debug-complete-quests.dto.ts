import { IsOptional, IsString, MinLength } from 'class-validator';

export class DebugCompleteQuestsDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  questKey?: string;
}
