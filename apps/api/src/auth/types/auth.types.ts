import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
}

export interface AuthenticatedRequest extends Request {
  authUser?: AuthenticatedUser;
  cookies: Record<string, string | undefined>;
}

