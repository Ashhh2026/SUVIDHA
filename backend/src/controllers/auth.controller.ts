import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middleware/auth';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, studentId, department, course, semester } = req.body;
      const { user, verificationToken } = await AuthService.registerStudent({
        name,
        email,
        password,
        studentId,
        department,
        course,
        semester,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your institutional email to activate your account.',
        data: {
          userId: user._id,
          email: user.email,
          verificationToken: process.env.NODE_ENV !== 'production' ? verificationToken : undefined,
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const token = req.query.token as string || req.body.token as string;
      if (!token) {
        res.status(400).json({ success: false, message: 'Verification token is required.' });
        return;
      }

      await AuthService.verifyEmail(token);
      res.json({
        success: true,
        message: 'Email successfully verified! You may now log in to Suvidha.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.login(email, password, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      // Set secure HttpOnly cookies
      res.cookie('accessToken', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      res.cookie('refreshToken', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        message: 'Login successful.',
        data: {
          user,
          accessToken,
        },
      });
    } catch (err: any) {
      res.status(401).json({ success: false, message: err.message });
    }
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken || req.headers['x-refresh-token'];

      if (!incomingRefreshToken) {
        res.status(401).json({ success: false, message: 'Refresh token missing.' });
        return;
      }

      const { accessToken, refreshToken: newRefreshToken, user } =
        await AuthService.refreshToken(incomingRefreshToken);

      res.cookie('accessToken', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', newRefreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        data: {
          user,
          accessToken,
        },
      });
    } catch (err: any) {
      res.status(401).json({ success: false, message: err.message });
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (req.user) {
        await AuthService.logout(req.user._id.toString());
      }
      res.clearCookie('accessToken', COOKIE_OPTIONS);
      res.clearCookie('refreshToken', COOKIE_OPTIONS);

      res.json({ success: true, message: 'Successfully logged out.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await req.user?.populate([
        { path: 'department', select: 'name code' },
        { path: 'course', select: 'name code durationYears' },
      ]);
      res.json({ success: true, data: { user } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const resetToken = await AuthService.forgotPassword(email);

      res.json({
        success: true,
        message: 'If the email is registered with us, a password reset link has been dispatched.',
        data: process.env.NODE_ENV !== 'production' ? { resetToken } : undefined,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;
      await AuthService.resetPassword(token, password);

      res.json({
        success: true,
        message: 'Password has been successfully updated. You may now log in with your new password.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(req.user!._id.toString(), currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
