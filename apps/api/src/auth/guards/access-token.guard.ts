import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { ACCESS_TOKEN_COOKIE } from '../auth.constants';
import { AuthService } from '../auth.service';
import type { AuthenticatedRequest } from '../types/auth.types';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const accessToken = this.extractAccessToken(request);

    if (!accessToken) {
      throw new UnauthorizedException('Missing access token');
    }

    request.authUser = await this.authService.getUserFromAccessToken(accessToken);
    return true;
  }

  private extractAccessToken(request: AuthenticatedRequest): string | undefined {
    const cookieToken = request.cookies?.[ACCESS_TOKEN_COOKIE];
    if (cookieToken) {
      return cookieToken;
    }

    const authorization = request.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return undefined;
    }

    const bearerToken = authorization.slice('Bearer '.length).trim();
    return bearerToken || undefined;
  }
}

