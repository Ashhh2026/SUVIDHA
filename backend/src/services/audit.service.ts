import { AuditLog } from '../models/AuditLog';
import { logger } from '../config/logger';

export const logAuditEvent = async (params: {
  userId?: string;
  action: string;
  category: 'auth' | 'grievance' | 'feedback' | 'admin' | 'security';
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}): Promise<void> => {
  try {
    // Sanitize details: never store passwords, secrets, or raw auth tokens
    const sanitizedDetails = { ...params.details };
    delete sanitizedDetails.password;
    delete sanitizedDetails.token;
    delete sanitizedDetails.refreshToken;
    delete sanitizedDetails.rawToken;

    await AuditLog.create({
      user: params.userId || null,
      action: params.action,
      category: params.category,
      ipAddress: params.ipAddress || 'unknown',
      userAgent: params.userAgent || 'unknown',
      details: sanitizedDetails,
    });
  } catch (err: any) {
    logger.error('Failed to write audit log:', err.message);
  }
};
