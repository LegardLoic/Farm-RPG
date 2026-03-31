import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { QuestsModule } from '../quests/quests.module';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';

@Module({
  imports: [AuthModule, QuestsModule],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [ShopsService],
})
export class ShopsModule {}
