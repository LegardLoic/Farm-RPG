import { IsIn, IsString } from 'class-validator';

export class InteractVillageNpcDto {
  @IsString()
  @IsIn(['mayor', 'blacksmith', 'merchant'])
  npcKey!: 'mayor' | 'blacksmith' | 'merchant';
}
