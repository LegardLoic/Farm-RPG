import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { GameplayController } from './gameplay.controller';
import { GameplayService } from './gameplay.service';

@Module({
  imports: [AuthModule],
  controllers: [GameplayController],
  providers: [GameplayService],
  exports: [GameplayService],
})
export class GameplayModule {}
