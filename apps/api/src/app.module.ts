import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { CombatModule } from './combat/combat.module';
import { HealthController } from './health/health.controller';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { DebugAdminModule } from './debug/debug-admin.module';
import { EquipmentModule } from './equipment/equipment.module';
import { GameplayModule } from './gameplay/gameplay.module';
import { InventoryModule } from './inventory/inventory.module';
import { ProfileModule } from './profile/profile.module';
import { QuestsModule } from './quests/quests.module';
import { SavesModule } from './saves/saves.module';
import { ShopsModule } from './shops/shops.module';
import { TowerModule } from './tower/tower.module';

const DEV_ONLY_MODULES = process.env.NODE_ENV === 'production' ? [] : [DebugAdminModule];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    AuthModule,
    InventoryModule,
    EquipmentModule,
    ProfileModule,
    GameplayModule,
    QuestsModule,
    ShopsModule,
    TowerModule,
    SavesModule,
    CombatModule,
    ...DEV_ONLY_MODULES,
  ],
  controllers: [HealthController],
})
export class AppModule {}
