import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { CombatModule } from './combat/combat.module';
import { HealthController } from './health/health.controller';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { EquipmentModule } from './equipment/equipment.module';
import { GameplayModule } from './gameplay/gameplay.module';
import { InventoryModule } from './inventory/inventory.module';
import { SavesModule } from './saves/saves.module';

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
    GameplayModule,
    SavesModule,
    CombatModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
