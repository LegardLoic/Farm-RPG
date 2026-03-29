import { IsIn, IsString, MinLength } from 'class-validator';

const DEBUG_QUEST_STATUSES = ['active', 'completed', 'claimed'] as const;

export class DebugSetQuestStatusDto {
  @IsString()
  @MinLength(1)
  questKey!: string;

  @IsString()
  @IsIn(DEBUG_QUEST_STATUSES)
  status!: (typeof DEBUG_QUEST_STATUSES)[number];
}
