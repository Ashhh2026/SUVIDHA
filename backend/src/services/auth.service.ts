import { User, IUser, UserRole } from '../models/User';
import { hashPassword, comparePassword } from '../utils/hash';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateRandomToken,
} from '../utils/token';
import { logAuditEvent } from './audit.service';
import { logger } from '../config/logger';

export class AuthService {
  static async registerStudent(data: {
    name: string;
    email: string;
    password: string;
    studentId?: string;
    department?: string;
    course?: string;
    semester?: number;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ user: IUser; verificationToken: string }> {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    if (data.studentId) {
      const existingId = await User.findOne({ studentId: data.studentId });
      if (existingId) {
        throw new Error('A student account with this Student ID already exists.');
      }
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = generateRandomToken();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: 'student',
      studentId: data.studentId,
      department: data.department || null,
      course: data.course || null,
      semester: data.semester || 1,
      isEmailVerified: false,
      verificationToken,
      verificationTokenExpires: tokenExpires,
      isActive: true,
    });

    // In dev / simulation mode, log the activation link directly to the console for ease of testing
    logger.info(`[EMAIL SIMULATION] Account verification link for ${user.email}: http://localhost:3000/verify-email?token=${verificationToken}`);

    await logAuditEvent({
      userId: user._id.toString(),
      action: 'USER_REGISTERED',
      category: 'auth',
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      details: { role: 'student', email: user.email },
    });

    return { user, verificationToken };
  }

  static async verifyEmail(token: string): Promise<IUser> {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Invalid or expired verification token.');
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    await logAuditEvent({
      userId: user._id.toString(),
      action: 'EMAIL_VERIFIED',
      category: 'auth',
      details: { email: user.email },
    });

    return user;
  }

  static async login(
    email: string,
    password: string,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await User.findOne({ email: email.toLowerCase() })
      .populate('department')
      .populate('course');

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new Error('This account has been deactivated. Please contact campus administration.');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      await logAuditEvent({
        userId: user._id.toString(),
        action: 'LOGIN_FAILED',
        category: 'security',
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
        details: { email },
      });
      throw new Error('Invalid email or password.');
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      departmentId: user.department?._id?.toString(),
      email: user.email,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store hashed refresh token for revocation tracking
    user.refreshTokenHash = await hashPassword(refreshToken);
    user.lastLogin = new Date();
    await user.save();

    await logAuditEvent({
      userId: user._id.toString(),
      action: 'USER_LOGIN_SUCCESS',
      category: 'auth',
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
      details: { role: user.role, email: user.email },
    });

    return { user, accessToken, refreshToken };
  }

  static async refreshToken(
    oldRefreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string; user: IUser }> {
    const payload = verifyRefreshToken(oldRefreshToken);
    const user = await User.findById(payload.userId);

    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new Error('Invalid session or user deactivated.');
    }

    // Verify token matches stored hash
    const isValid = await comparePassword(oldRefreshToken, user.refreshTokenHash);
    if (!isValid) {
      // Possible token reuse attempt: invalidate all sessions
      user.refreshTokenHash = undefined;
      await user.save();
      throw new Error('Invalid refresh token. Please log in again.');
    }

    // Rotate refresh token
    const newPayload = {
      userId: user._id.toString(),
      role: user.role,
      departmentId: user.department?._id?.toString(),
      email: user.email,
    };

    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    user.refreshTokenHash = await hashPassword(newRefreshToken);
    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, user };
  }

  static async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshTokenHash: undefined });
  }

  static async forgotPassword(email: string): Promise<string | null> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return null silently to prevent user enumeration
      return null;
    }

    const resetToken = generateRandomToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    logger.info(`[EMAIL SIMULATION] Password reset link for ${user.email}: http://localhost:3000/reset-password?token=${resetToken}`);
    return resetToken;
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Invalid or expired password reset link.');
    }

    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokenHash = undefined; // Revoke existing sessions
    await user.save();

    await logAuditEvent({
      userId: user._id.toString(),
      action: 'PASSWORD_RESET_SUCCESS',
      category: 'security',
      details: { email: user.email },
    });
  }

  static async changePassword(
    userId: string,
    currentPass: string,
    newPass: string
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const isMatch = await comparePassword(currentPass, user.password);
    if (!isMatch) {
      throw new Error('Current password does not match.');
    }

    user.password = await hashPassword(newPass);
    user.refreshTokenHash = undefined;
    await user.save();

    await logAuditEvent({
      userId: user._id.toString(),
      action: 'PASSWORD_CHANGED',
      category: 'security',
      details: { email: user.email },
    });
  }
}
