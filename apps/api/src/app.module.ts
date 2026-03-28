import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { GameplayModule } from './gameplay/gameplay.module';
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
    GameplayModule,
    SavesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
