import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { GameplayController } from './gameplay.controller';

@Module({
  imports: [AuthModule],
  controllers: [GameplayController],
})
export class GameplayModule {}

