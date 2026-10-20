import {
  Grievance,
  IGrievance,
  GrievanceCategory,
  GrievancePriority,
  GrievanceStatus,
} from '../models/Grievance';
import { GrievanceUpdate, IGrievanceUpdate } from '../models/GrievanceUpdate';
import { generateGrievanceReference } from '../utils/reference';
import { generateAnonymousTrackingToken, hashToken } from '../utils/token';
import { createNotification } from './notification.service';
import { logAuditEvent } from './audit.service';
import { User, IUser } from '../models/User';
import mongoose from 'mongoose';

const calculateSLADate = (priority: GrievancePriority): Date => {
  const daysMap: Record<GrievancePriority, number> = {
    critical: 1, // 24 hours
    high: 3,
    medium: 7,
    low: 14,
  };
  const days = daysMap[priority] || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

export class GrievanceService {
  static async submitGrievance(
    data: {
      title: string;
      description: string;
      category: GrievanceCategory;
      priority: GrievancePriority;
      submissionMode: 'identified' | 'anonymous';
      department?: string;
      incidentDate?: string;
      location?: string;
      attachments?: { fileName: string; fileUrl: string; fileSize: number; fileType: string }[];
    },
    studentUser?: IUser,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ grievance: IGrievance; trackingToken?: string }> {
    const referenceNumber = generateGrievanceReference();
    const isAnonymous = data.submissionMode === 'anonymous';
    const isSensitive = data.category === 'harassment_misconduct';

    let trackingToken: string | undefined;
    let tokenHash: string | undefined;

    if (isAnonymous) {
      const tokenPair = generateAnonymousTrackingToken();
      trackingToken = tokenPair.rawToken;
      tokenHash = tokenPair.tokenHash;
    }

    const targetResolutionDate = calculateSLADate(data.priority);

    const grievance = await Grievance.create({
      referenceNumber,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      isSensitive,
      submissionMode: data.submissionMode,
      student: isAnonymous ? null : studentUser?._id || null,
      anonymousTrackingTokenHash: tokenHash,
      department: data.department || null,
      status: 'submitted',
      incidentDate: data.incidentDate ? new Date(data.incidentDate) : undefined,
      location: data.location,
      targetResolutionDate,
      attachments: data.attachments || [],
    });

    // Record initial status change update
    await GrievanceUpdate.create({
      grievance: grievance._id,
      author: isAnonymous ? null : studentUser?._id,
      authorRole: isAnonymous ? 'anonymous_student' : 'student',
      authorName: isAnonymous ? 'Anonymous Student' : studentUser?.name || 'Student',
      updateType: 'status_change',
      message: `Grievance submitted with priority: ${data.priority.toUpperCase()}`,
      newStatus: 'submitted',
      isInternalOnly: false,
    });

    // Send confirmation notification to identified student
    if (!isAnonymous && studentUser) {
      await createNotification({
        recipientId: studentUser._id.toString(),
        title: 'Grievance Registered',
        message: `Your grievance has been logged as #${referenceNumber}. You can track updates on your dashboard.`,
        type: 'grievance',
        relatedId: grievance._id.toString(),
        link: `/student/submissions?tab=grievances&ref=${referenceNumber}`,
      });
    }

    await logAuditEvent({
      userId: isAnonymous ? undefined : studentUser?._id.toString(),
      action: 'GRIEVANCE_FILED',
      category: 'grievance',
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
      details: {
        referenceNumber,
        category: data.category,
        priority: data.priority,
        submissionMode: data.submissionMode,
        isSensitive,
      },
    });

    return { grievance, trackingToken };
  }

  // Lookup grievance using anonymous tracking token
  static async trackAnonymousGrievance(rawToken: string): Promise<{
    grievance: any;
    updates: IGrievanceUpdate[];
  }> {
    const tokenHash = hashToken(rawToken);
    const grievance = await Grievance.findOne({ anonymousTrackingTokenHash: tokenHash })
      .populate('department', 'name code')
      .populate('assignedTo', 'name role');

    if (!grievance) {
      throw new Error('No grievance found matching this tracking token. Please verify and try again.');
    }

    // Only return updates that are NOT internal notes
    const updates = await GrievanceUpdate.find({
      grievance: grievance._id,
      isInternalOnly: false,
    }).sort({ createdAt: 1 });

    const sanitizedGrievance = grievance.toObject();
    delete sanitizedGrievance.anonymousTrackingTokenHash;
    delete sanitizedGrievance.student;

    return { grievance: sanitizedGrievance, updates };
  }

  // Get single grievance with authorization checks
  static async getGrievanceById(
    grievanceId: string,
    requestUser: IUser
  ): Promise<{ grievance: any; updates: IGrievanceUpdate[] }> {
    const grievance = await Grievance.findById(grievanceId)
      .populate('student', 'name email studentId')
      .populate('department', 'name code')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name');

    if (!grievance) {
      throw new Error('Grievance not found.');
    }

    // Security check:
    // 1. If student: can only view if identified submitter matches student's ID
    if (requestUser.role === 'student') {
      if (!grievance.student || grievance.student._id.toString() !== requestUser._id.toString()) {
        throw new Error('Unauthorized: You do not have permission to view this grievance.');
      }
    }

    // 2. Sensitive check: Faculty cannot view sensitive (harassment/misconduct) unless explicitly assigned by admin
    if (grievance.isSensitive && requestUser.role === 'faculty') {
      if (!grievance.assignedTo || grievance.assignedTo._id.toString() !== requestUser._id.toString()) {
        throw new Error('Access restricted: Sensitive grievance accessible only by authorized administrators.');
      }
    }

    // 3. Faculty: can view only if assigned to them or in their department coordinator role
    if (requestUser.role === 'faculty') {
      const isAssigned = grievance.assignedTo && grievance.assignedTo._id.toString() === requestUser._id.toString();
      if (!isAssigned) {
        throw new Error('Unauthorized: You can only access grievances assigned to you.');
      }
    }

    // Determine which updates to return: students only see non-internal updates
    const isStaff = ['faculty', 'coordinator', 'admin'].includes(requestUser.role);
    const updateQuery: any = { grievance: grievance._id };
    if (!isStaff) {
      updateQuery.isInternalOnly = false;
    }

    const updates = await GrievanceUpdate.find(updateQuery).sort({ createdAt: 1 });

    const obj = grievance.toObject();
    if (obj.submissionMode === 'anonymous') {
      delete obj.student;
      delete obj.anonymousTrackingTokenHash;
    }

    return { grievance: obj, updates };
  }

  // Add official update, status transition, or internal note
  static async addGrievanceUpdate(params: {
    grievanceId: string;
    authorUser: IUser;
    updateType: 'status_change' | 'official_response' | 'internal_note';
    message: string;
    newStatus?: GrievanceStatus;
    isInternalOnly?: boolean;
    resolutionSummary?: string;
  }): Promise<IGrievanceUpdate> {
    const grievance = await Grievance.findById(params.grievanceId);
    if (!grievance) {
      throw new Error('Grievance not found.');
    }

    const previousStatus = grievance.status;
    let statusChanged = false;

    if (params.newStatus && params.newStatus !== previousStatus) {
      grievance.status = params.newStatus;
      statusChanged = true;

      if (params.newStatus === 'resolved') {
        grievance.resolvedAt = new Date();
        grievance.resolutionSummary = params.resolutionSummary || params.message;
      } else if (params.newStatus === 'closed') {
        grievance.closedAt = new Date();
      }
      await grievance.save();
    }

    const update = await GrievanceUpdate.create({
      grievance: grievance._id,
      author: params.authorUser._id,
      authorRole: params.authorUser.role,
      authorName: `${params.authorUser.name} (${params.authorUser.role.toUpperCase()})`,
      updateType: params.updateType,
      message: params.message,
      previousStatus: statusChanged ? previousStatus : undefined,
      newStatus: statusChanged ? params.newStatus : undefined,
      isInternalOnly: params.isInternalOnly || false,
    });

    // Notify identified student if response is student-visible
    if (grievance.student && !params.isInternalOnly) {
      const actionText = statusChanged
        ? `Status updated to ${params.newStatus?.replace('_', ' ').toUpperCase()}`
        : 'New official response added';

      await createNotification({
        recipientId: grievance.student.toString(),
        title: `Grievance #${grievance.referenceNumber} Update`,
        message: `${actionText}: "${params.message.slice(0, 100)}${params.message.length > 100 ? '...' : ''}"`,
        type: 'grievance',
        relatedId: grievance._id.toString(),
        link: `/student/submissions?tab=grievances&ref=${grievance.referenceNumber}`,
      });
    }

    await logAuditEvent({
      userId: params.authorUser._id.toString(),
      action: statusChanged ? 'GRIEVANCE_STATUS_UPDATED' : 'GRIEVANCE_RESPONSE_ADDED',
      category: 'grievance',
      details: {
        grievanceId: grievance._id.toString(),
        referenceNumber: grievance.referenceNumber,
        previousStatus,
        newStatus: params.newStatus,
        isInternalOnly: params.isInternalOnly,
      },
    });

    return update;
  }

  // Student reply to existing grievance
  static async addStudentReply(params: {
    grievanceId: string;
    message: string;
    studentUser?: IUser;
    trackingToken?: string;
  }): Promise<IGrievanceUpdate> {
    const grievance = await Grievance.findById(params.grievanceId);
    if (!grievance) {
      throw new Error('Grievance not found.');
    }

    let isAnonymous = false;
    let authorName = 'Student';

    if (grievance.submissionMode === 'anonymous') {
      if (!params.trackingToken) {
        throw new Error('Tracking token required for anonymous response.');
      }
      const tokenHash = hashToken(params.trackingToken);
      if (grievance.anonymousTrackingTokenHash !== tokenHash) {
        throw new Error('Invalid tracking token.');
      }
      isAnonymous = true;
      authorName = 'Anonymous Student';
    } else {
      if (!params.studentUser || grievance.student?.toString() !== params.studentUser._id.toString()) {
        throw new Error('Unauthorized to reply to this grievance.');
      }
      authorName = params.studentUser.name;
    }

    const update = await GrievanceUpdate.create({
      grievance: grievance._id,
      author: isAnonymous ? null : params.studentUser?._id,
      authorRole: isAnonymous ? 'anonymous_student' : 'student',
      authorName,
      updateType: 'student_reply',
      message: params.message,
      isInternalOnly: false,
    });

    // Notify assigned staff if present
    if (grievance.assignedTo) {
      await createNotification({
        recipientId: grievance.assignedTo.toString(),
        title: `Reply on Grievance #${grievance.referenceNumber}`,
        message: `Student replied: "${params.message.slice(0, 100)}"`,
        type: 'grievance',
        relatedId: grievance._id.toString(),
        link: `/faculty/grievances`,
      });
    }

    return update;
  }

  // Reopen grievance
  static async reopenGrievance(
    grievanceId: string,
    reopenReason: string,
    studentUser: IUser
  ): Promise<void> {
    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      throw new Error('Grievance not found.');
    }

    if (!grievance.student || grievance.student.toString() !== studentUser._id.toString()) {
      throw new Error('Unauthorized: Only the submitter can reopen this grievance.');
    }

    if (!['resolved', 'closed'].includes(grievance.status)) {
      throw new Error('Only resolved or closed grievances can be reopened.');
    }

    const prevStatus = grievance.status;
    grievance.status = 'reopened';
    grievance.reopenReason = reopenReason;
    await grievance.save();

    await GrievanceUpdate.create({
      grievance: grievance._id,
      author: studentUser._id,
      authorRole: 'student',
      authorName: studentUser.name,
      updateType: 'status_change',
      message: `Grievance reopened by student. Reason: ${reopenReason}`,
      previousStatus: prevStatus,
      newStatus: 'reopened',
      isInternalOnly: false,
    });

    if (grievance.assignedTo) {
      await createNotification({
        recipientId: grievance.assignedTo.toString(),
        title: `Grievance Reopened #${grievance.referenceNumber}`,
        message: `Student reopened grievance. Reason: "${reopenReason.slice(0, 80)}"`,
        type: 'grievance',
        relatedId: grievance._id.toString(),
        link: `/faculty/grievances`,
      });
    }
  }

  // Assign grievance to faculty or staff member
  static async assignGrievance(
    grievanceId: string,
    assignedToUserId: string,
    assignedByUser: IUser,
    targetResolutionDate?: string,
    notes?: string
  ): Promise<void> {
    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      throw new Error('Grievance not found.');
    }

    const targetUser = await User.findById(assignedToUserId);
    if (!targetUser) {
      throw new Error('Assignee user not found.');
    }

    const previousStatus = grievance.status;
    grievance.assignedTo = targetUser._id;
    grievance.assignedBy = assignedByUser._id;
    grievance.assignedAt = new Date();
    grievance.status = 'assigned';

    if (targetResolutionDate) {
      grievance.targetResolutionDate = new Date(targetResolutionDate);
    }
    await grievance.save();

    await GrievanceUpdate.create({
      grievance: grievance._id,
      author: assignedByUser._id,
      authorRole: assignedByUser.role,
      authorName: assignedByUser.name,
      updateType: 'assignment',
      message: `Assigned to ${targetUser.name} (${targetUser.role.toUpperCase()}). ${notes ? 'Note: ' + notes : ''}`,
      previousStatus,
      newStatus: 'assigned',
      isInternalOnly: false,
    });

    // Notify assigned staff
    await createNotification({
      recipientId: targetUser._id.toString(),
      title: 'New Grievance Assigned',
      message: `You have been assigned grievance #${grievance.referenceNumber} (${grievance.title}). Priority: ${grievance.priority}.`,
      type: 'grievance',
      relatedId: grievance._id.toString(),
      link: `/faculty/grievances`,
    });
  }

  // Duplicate issue detection (Feature 14-B)
  static async checkSimilarGrievances(
    category: string,
    title: string,
    department?: string
  ): Promise<any[]> {
    const words = title
      .split(' ')
      .filter((w) => w.length > 3)
      .slice(0, 4);

    if (words.length === 0) return [];

    const regexArray = words.map((w) => ({
      title: { $regex: w, $options: 'i' },
    }));

    const query: any = {
      category,
      isSensitive: false, // Never check against or expose sensitive harassment reports!
      status: { $in: ['submitted', 'under_review', 'assigned', 'in_progress'] },
      $or: regexArray,
    };

    if (department) {
      query.department = department;
    }

    const duplicates = await Grievance.find(query)
      .select('referenceNumber title category status createdAt')
      .limit(3);

    return duplicates;
  }
}
