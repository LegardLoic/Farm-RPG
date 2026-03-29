import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { QuestsModule } from '../quests/quests.module';
import { TowerModule } from '../tower/tower.module';
import { CombatController } from './combat.controller';
import { CombatService } from './combat.service';

@Module({
  imports: [AuthModule, QuestsModule, TowerModule],
  controllers: [CombatController],
  providers: [CombatService],
  exports: [CombatService],
})
export class CombatModule {}
