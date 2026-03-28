import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { GoogleUserProfile } from './google.strategy';

type GoogleRequest = Request & {
  user?: GoogleUserProfile;
};

@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {
    return undefined;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() req: GoogleRequest) {
    return {
      status: 'ok',
      message: 'Google auth callback skeleton',
      user: req.user ?? null,
    };
  }
}
