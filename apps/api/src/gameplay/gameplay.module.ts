import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { QuestsModule } from '../quests/quests.module';
import { GameplayController } from './gameplay.controller';
import { GameplayService } from './gameplay.service';
import { TowerModule } from '../tower/tower.module';

@Module({
  imports: [AuthModule, TowerModule, QuestsModule],
  controllers: [GameplayController],
  providers: [GameplayService],
  exports: [GameplayService],
})
export class GameplayModule {}
