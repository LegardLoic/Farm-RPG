import { Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { REFRESH_TOKEN_COOKIE } from './auth.constants';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/access-token.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { GoogleUserProfile } from './google.strategy';
import type { AuthenticatedRequest } from './types/auth.types';

type GoogleRequest = Request & {
  user?: GoogleUserProfile;
  cookies: Record<string, string | undefined>;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {
    return undefined;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: GoogleRequest, @Res() res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedException('Google auth user payload missing');
    }

    const { user, tokens } = await this.authService.signInWithGoogle(req.user, this.getSessionMeta(req));
    this.authService.setAuthCookies(res, tokens);

    const frontendUrl = this.authService.getFrontendUrl();
    if (frontendUrl) {
      const redirectUrl = `${frontendUrl.replace(/\/+$/, '')}/?auth=success`;
      res.redirect(redirectUrl);
      return;
    }

    res.status(200).json({
      status: 'ok',
      message: 'Google auth callback complete',
      user,
    });
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  getMe(@Req() req: AuthenticatedRequest) {
    return {
      status: 'ok',
      user: req.authUser,
    };
  }

  @Post('refresh')
  async refresh(@Req() req: GoogleRequest, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const { user, tokens } = await this.authService.refreshSession(refreshToken, this.getSessionMeta(req));
    this.authService.setAuthCookies(res, tokens);

    return {
      status: 'ok',
      message: 'Session refreshed',
      user,
    };
  }

  @Post('logout')
  async logout(@Req() req: GoogleRequest, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (refreshToken) {
      await this.authService.revokeSessionByRefreshToken(refreshToken);
    }

    this.authService.clearAuthCookies(res);

    return {
      status: 'ok',
      message: 'Logged out',
    };
  }

  private getSessionMeta(req: Request): { userAgent?: string; ipAddress?: string } {
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress =
      typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : req.socket.remoteAddress ?? req.ip;

    return {
      userAgent: req.headers['user-agent'],
      ipAddress,
    };
  }
}
