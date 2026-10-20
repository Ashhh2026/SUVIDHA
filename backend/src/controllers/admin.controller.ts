import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { User, IUser } from '../models/User';
import { Grievance } from '../models/Grievance';
import { Feedback } from '../models/Feedback';
import { AuditLog } from '../models/AuditLog';
import { GrievanceService } from '../services/grievance.service';
import { logAuditEvent } from '../services/audit.service';

export class AdminController {
  // User Management
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { role, search, department, isActive, page, limit } = req.query;
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, parseInt(limit as string, 10) || 20);

      const query: any = {};
      if (role) query.role = role;
      if (department) query.department = department;
      if (isActive !== undefined) query.isActive = isActive === 'true';

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } },
        ];
      }

      const total = await User.countDocuments(query);
      const users = await User.find(query)
        .populate('department', 'name code')
        .populate('course', 'name code')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      res.json({
        success: true,
        data: {
          users,
          total,
          page: pageNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { role, isActive, department } = req.body;

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      if (role) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
      if (department !== undefined) user.department = department || null;

      await user.save();

      await logAuditEvent({
        userId: req.user!._id.toString(),
        action: 'ADMIN_UPDATE_USER',
        category: 'admin',
        details: { targetUserId: id, role, isActive, department },
      });

      res.json({ success: true, message: 'User account updated successfully.', data: { user } });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Grievance assignment & escalation
  static async assignGrievance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { assignedTo, targetResolutionDate, notes } = req.body;

      await GrievanceService.assignGrievance(
        id,
        assignedTo,
        req.user!,
        targetResolutionDate,
        notes
      );

      res.json({
        success: true,
        message: 'Grievance assigned successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // All grievances list for Admin / Coordinator
  static async getAllGrievances(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { category, priority, status, department, isSensitive, search, page, limit } = req.query;
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, parseInt(limit as string, 10) || 20);

      const query: any = {};
      if (category) query.category = category;
      if (priority) query.priority = priority;
      if (status) query.status = status;
      if (department) query.department = department;
      if (isSensitive !== undefined) query.isSensitive = isSensitive === 'true';

      // Department coordinator filter
      if (req.user?.role === 'coordinator' && req.user.department) {
        query.department = req.user.department;
      }

      if (search) {
        query.$or = [
          { referenceNumber: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const total = await Grievance.countDocuments(query);
      const rawGrievances = await Grievance.find(query)
        .populate('student', 'name email studentId')
        .populate('department', 'name code')
        .populate('assignedTo', 'name email role')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      // Mask student info for anonymous grievances
      const grievances = rawGrievances.map((g) => {
        const doc = g.toObject();
        if (doc.submissionMode === 'anonymous') {
          delete doc.student;
          delete doc.anonymousTrackingTokenHash;
        }
        return doc;
      });

      res.json({
        success: true,
        data: {
          grievances,
          total,
          page: pageNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Audit Logs
  static async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const { category, page, limit } = req.query;
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, parseInt(limit as string, 10) || 50);

      const query: any = {};
      if (category) query.category = category;

      const total = await AuditLog.countDocuments(query);
      const logs = await AuditLog.find(query)
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      res.json({
        success: true,
        data: {
          logs,
          total,
          page: pageNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Export CSV Report with privacy masking
  static async exportReport(req: Request, res: Response): Promise<void> {
    try {
      const type = req.query.type as string; // 'feedback' or 'grievances'

      if (type === 'feedback') {
        const feedbacks = await Feedback.find()
          .populate('department', 'code')
          .populate('course', 'code')
          .populate('subject', 'code')
          .sort({ createdAt: -1 });

        let csv = 'ReferenceNumber,Category,SubmissionMode,Department,OverallRating,Sentiment,CreatedAt\n';
        feedbacks.forEach((fb) => {
          const dept = (fb.department as any)?.code || 'N/A';
          csv += `"${fb.referenceNumber}","${fb.category}","${fb.submissionMode}","${dept}",${fb.overallRating},"${fb.sentiment}","${fb.createdAt.toISOString()}"\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment(`suvidha-feedback-report-${Date.now()}.csv`);
        res.send(csv);
        return;
      }

      if (type === 'grievances') {
        const grievances = await Grievance.find()
          .populate('department', 'code')
          .populate('assignedTo', 'name')
          .sort({ createdAt: -1 });

        let csv = 'ReferenceNumber,Title,Category,Priority,Status,SubmissionMode,Department,AssignedTo,CreatedAt\n';
        grievances.forEach((g) => {
          const dept = (g.department as any)?.code || 'N/A';
          const assignee = (g.assignedTo as any)?.name || 'Unassigned';
          const safeTitle = g.title.replace(/"/g, '""');
          csv += `"${g.referenceNumber}","${safeTitle}","${g.category}","${g.priority}","${g.status}","${g.submissionMode}","${dept}","${assignee}","${g.createdAt.toISOString()}"\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment(`suvidha-grievances-report-${Date.now()}.csv`);
        res.send(csv);
        return;
      }

      res.status(400).json({ success: false, message: 'Invalid export type. Use feedback or grievances.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
