import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import { UpsertPlayerProfileDto } from './dto/upsert-player-profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(AccessTokenGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Req() req: AuthenticatedRequest) {
    return {
      status: 'ok',
      profile: await this.profileService.getProfile(req.authUser!.id),
    };
  }

  @Put()
  async upsertProfile(@Req() req: AuthenticatedRequest, @Body() dto: UpsertPlayerProfileDto) {
    return {
      status: 'ok',
      profile: await this.profileService.upsertProfile(
        req.authUser!.id,
        dto.heroName,
        dto.appearanceKey,
      ),
    };
  }
}
