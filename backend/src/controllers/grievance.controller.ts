import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { GrievanceService } from '../services/grievance.service';
import { Grievance } from '../models/Grievance';

export class GrievanceController {
  static async submit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { grievance, trackingToken } = await GrievanceService.submitGrievance(
        req.body,
        req.user,
        {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        }
      );

      res.status(201).json({
        success: true,
        message: 'Grievance submitted successfully.',
        data: {
          grievance,
          referenceNumber: grievance.referenceNumber,
          trackingToken, // Provided once to anonymous submitter
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getMyGrievances(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const studentId = req.user!._id;
      const grievances = await Grievance.find({ student: studentId })
        .populate('department', 'name code')
        .populate('assignedTo', 'name role')
        .sort({ createdAt: -1 });

      res.json({ success: true, data: { grievances } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await GrievanceService.getGrievanceById(id, req.user!);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(403).json({ success: false, message: err.message });
    }
  }

  static async trackAnonymous(req: Request, res: Response): Promise<void> {
    try {
      const token = (req.body.token || req.query.token) as string;
      if (!token) {
        res.status(400).json({ success: false, message: 'Tracking token is required.' });
        return;
      }

      const result = await GrievanceService.trackAnonymousGrievance(token);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status, message, isInternalOnly, resolutionSummary } = req.body;

      const update = await GrievanceService.addGrievanceUpdate({
        grievanceId: id,
        authorUser: req.user!,
        updateType: isInternalOnly ? 'internal_note' : 'official_response',
        message,
        newStatus: status,
        isInternalOnly,
        resolutionSummary,
      });

      res.json({
        success: true,
        message: 'Status and response updated successfully.',
        data: { update },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async reply(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { message, token } = req.body;

      const update = await GrievanceService.addStudentReply({
        grievanceId: id,
        message,
        studentUser: req.user,
        trackingToken: token,
      });

      res.json({
        success: true,
        message: 'Reply posted successfully.',
        data: { update },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async reopen(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { reopenReason } = req.body;

      await GrievanceService.reopenGrievance(id, reopenReason, req.user!);
      res.json({
        success: true,
        message: 'Grievance has been reopened. Staff will review your follow-up.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async checkDuplicates(req: Request, res: Response): Promise<void> {
    try {
      const { category, title, department } = req.query;
      if (!category || !title) {
        res.json({ success: true, data: { duplicates: [] } });
        return;
      }

      const duplicates = await GrievanceService.checkSimilarGrievances(
        category as string,
        title as string,
        department as string
      );

      res.json({ success: true, data: { duplicates } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
