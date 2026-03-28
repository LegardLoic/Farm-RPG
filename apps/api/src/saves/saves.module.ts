import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SavesController } from './saves.controller';

@Module({
  imports: [AuthModule],
  controllers: [SavesController],
})
export class SavesModule {}

