import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { TowerController } from './tower.controller';
import { TowerService } from './tower.service';

@Module({
  imports: [AuthModule],
  controllers: [TowerController],
  providers: [TowerService],
  exports: [TowerService],
})
export class TowerModule {}
