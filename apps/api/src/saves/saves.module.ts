import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SavesController } from './saves.controller';
import { SavesService } from './saves.service';

@Module({
  imports: [AuthModule],
  controllers: [SavesController],
  providers: [SavesService],
})
export class SavesModule {}
