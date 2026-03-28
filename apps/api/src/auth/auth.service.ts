import { createHash, randomBytes, randomUUID } from 'crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import type { StringValue } from 'ms';

import { DatabaseService } from '../database/database.service';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './auth.constants';
import type { GoogleUserProfile } from './google.strategy';
import type { AuthenticatedUser } from './types/auth.types';

type SessionMeta = {
  userAgent?: string;
  ipAddress?: string;
};

type IssuedTokens = {
  accessToken: string;
  refreshToken: string;
};

type UserRow = {
  id: string;
  email: string;
  display_name: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
};

type SessionUserRow = UserRow & {
  session_id: string;
  expires_at: Date;
  revoked_at: Date | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  async signInWithGoogle(
    profile: GoogleUserProfile,
    meta: SessionMeta,
  ): Promise<{ user: AuthenticatedUser; tokens: IssuedTokens }> {
    if (!profile.email) {
      throw new UnauthorizedException('Google account has no email address');
    }

    const user = await this.upsertGoogleUser(profile);
    const tokens = await this.issueSessionTokens(user, meta);
    return { user, tokens };
  }

  async refreshSession(
    refreshToken: string,
    meta: SessionMeta,
  ): Promise<{ user: AuthenticatedUser; tokens: IssuedTokens }> {
    const refreshTokenHash = this.hashToken(refreshToken);
    const row = await this.findSessionByRefreshHash(refreshTokenHash);

    if (!row || row.revoked_at || row.expires_at.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh session is invalid or expired');
    }

    await this.revokeSessionById(row.session_id);

    const user = this.mapUserRow(row);
    const tokens = await this.issueSessionTokens(user, meta);
    return { user, tokens };
  }

  async getUserFromAccessToken(accessToken: string): Promise<AuthenticatedUser> {
    const payload = this.verifyAccessToken(accessToken);
    const userId = payload.sub;

    if (typeof userId !== 'string' || userId.length === 0) {
      throw new UnauthorizedException('Access token payload is invalid');
    }

    const result = await this.databaseService.query<UserRow>(
      `
        SELECT id, email, display_name, first_name, last_name, photo_url
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [userId],
    );

    const row = result.rows[0];
    if (!row) {
      throw new UnauthorizedException('User not found for access token');
    }

    return this.mapUserRow(row);
  }

  async revokeSessionByRefreshToken(refreshToken: string): Promise<void> {
    const refreshTokenHash = this.hashToken(refreshToken);
    await this.databaseService.query(
      `
        UPDATE auth_sessions
        SET revoked_at = NOW()
        WHERE refresh_token_hash = $1
          AND revoked_at IS NULL
      `,
      [refreshTokenHash],
    );
  }

  setAuthCookies(res: Response, tokens: IssuedTokens): void {
    const secure = this.configService.get<string>('NODE_ENV') === 'production';
    const sameSite = secure ? 'none' : 'lax';
    const refreshDays = this.configService.get<number>('REFRESH_TOKEN_TTL_DAYS', 30);

    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/auth',
      maxAge: refreshDays * 24 * 60 * 60 * 1000,
    });
  }

  clearAuthCookies(res: Response): void {
    const secure = this.configService.get<string>('NODE_ENV') === 'production';
    const sameSite = secure ? 'none' : 'lax';

    res.clearCookie(ACCESS_TOKEN_COOKIE, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
    });

    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/auth',
    });
  }

  getFrontendUrl(): string | undefined {
    return this.configService.get<string>('FRONTEND_URL');
  }

  private async upsertGoogleUser(profile: GoogleUserProfile): Promise<AuthenticatedUser> {
    const result = await this.databaseService.query<UserRow>(
      `
        INSERT INTO users (
          id,
          provider,
          provider_id,
          email,
          display_name,
          first_name,
          last_name,
          photo_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (provider, provider_id)
        DO UPDATE
          SET email = EXCLUDED.email,
              display_name = EXCLUDED.display_name,
              first_name = EXCLUDED.first_name,
              last_name = EXCLUDED.last_name,
              photo_url = EXCLUDED.photo_url,
              updated_at = NOW()
        RETURNING id, email, display_name, first_name, last_name, photo_url
      `,
      [
        randomUUID(),
        profile.provider,
        profile.providerId,
        profile.email,
        profile.displayName,
        profile.firstName,
        profile.lastName,
        profile.photoUrl ?? null,
      ],
    );

    return this.mapUserRow(result.rows[0]);
  }

  private async issueSessionTokens(
    user: AuthenticatedUser,
    meta: SessionMeta,
  ): Promise<IssuedTokens> {
    const accessToken = this.signAccessToken(user);
    const refreshToken = randomBytes(48).toString('base64url');
    const refreshTokenHash = this.hashToken(refreshToken);

    const refreshDays = this.configService.get<number>('REFRESH_TOKEN_TTL_DAYS', 30);
    const expiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);

    await this.databaseService.query(
      `
        INSERT INTO auth_sessions (
          id,
          user_id,
          refresh_token_hash,
          user_agent,
          ip_address,
          expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [randomUUID(), user.id, refreshTokenHash, meta.userAgent ?? null, meta.ipAddress ?? null, expiresAt],
    );

    return { accessToken, refreshToken };
  }

  private signAccessToken(user: AuthenticatedUser): string {
    const accessTokenSecret = this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET');
    const accessTokenTtl = this.configService.get<string>('ACCESS_TOKEN_TTL', '15m') as StringValue;

    return sign(
      {
        sub: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      accessTokenSecret,
      { expiresIn: accessTokenTtl },
    );
  }

  private verifyAccessToken(accessToken: string): JwtPayload {
    const accessTokenSecret = this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET');

    try {
      const payload = verify(accessToken, accessTokenSecret);
      if (typeof payload === 'string') {
        throw new UnauthorizedException('Access token payload has invalid shape');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Access token is invalid or expired');
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async findSessionByRefreshHash(refreshTokenHash: string): Promise<SessionUserRow | undefined> {
    const result = await this.databaseService.query<SessionUserRow>(
      `
        SELECT
          s.id AS session_id,
          s.expires_at,
          s.revoked_at,
          u.id,
          u.email,
          u.display_name,
          u.first_name,
          u.last_name,
          u.photo_url
        FROM auth_sessions AS s
        INNER JOIN users AS u
          ON u.id = s.user_id
        WHERE s.refresh_token_hash = $1
        LIMIT 1
      `,
      [refreshTokenHash],
    );

    return result.rows[0];
  }

  private async revokeSessionById(sessionId: string): Promise<void> {
    await this.databaseService.query(
      `
        UPDATE auth_sessions
        SET revoked_at = NOW()
        WHERE id = $1
          AND revoked_at IS NULL
      `,
      [sessionId],
    );
  }

  private mapUserRow(row: UserRow): AuthenticatedUser {
    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      firstName: row.first_name,
      lastName: row.last_name,
      photoUrl: row.photo_url ?? undefined,
    };
  }
}
