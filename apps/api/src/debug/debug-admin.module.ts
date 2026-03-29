import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DebugAdminController } from './debug-admin.controller';
import { DebugAdminService } from './debug-admin.service';

@Module({
  imports: [AuthModule],
  controllers: [DebugAdminController],
  providers: [DebugAdminService],
})
export class DebugAdminModule {}
