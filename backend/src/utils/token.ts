import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env';

export interface TokenPayload {
  userId: string;
  role: 'student' | 'faculty' | 'coordinator' | 'admin';
  departmentId?: string;
  email: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
    expiresIn: ENV.JWT_ACCESS_EXPIRES_IN as any,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as any,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as TokenPayload;
};

// Generates an unguessable 32-character random tracking token for anonymous tickets
export const generateAnonymousTrackingToken = (): { rawToken: string; tokenHash: string } => {
  const rawToken = 'trk_' + crypto.randomBytes(16).toString('hex');
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
};

// Cryptographic hash for token storage and lookup
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
};

// Random verification or reset token
export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};
