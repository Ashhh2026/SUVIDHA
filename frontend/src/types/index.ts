export type UserRole = 'student' | 'faculty' | 'coordinator' | 'admin';

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: { _id: string; name: string };
  coordinator?: { _id: string; name: string };
  isActive: boolean;
}

export interface Course {
  _id: string;
  name: string;
  code: string;
  department: string | Department;
  durationYears: number;
  totalSemesters: number;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  department: string | Department;
  course: string | Course;
  semester: number;
  faculty: Array<{ _id: string; name: string; email: string }>;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  facultyId?: string;
  department?: Department | string;
  course?: Course | string;
  semester?: number;
  phone?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export type FeedbackCategory =
  | 'course_curriculum'
  | 'faculty_teaching'
  | 'infrastructure_facilities'
  | 'library_laboratory'
  | 'hostel_mess'
  | 'campus_cleanliness'
  | 'transport_parking'
  | 'it_services'
  | 'general_suggestions'
  | 'other';

export type SubmissionMode = 'identified' | 'anonymous';

export interface FeedbackCriteria {
  label: string;
  score: number;
}

export interface Feedback {
  _id: string;
  referenceNumber: string;
  category: FeedbackCategory;
  submissionMode: SubmissionMode;
  student?: { _id: string; name: string; email: string; studentId?: string };
  department?: Department;
  course?: Course;
  subject?: Subject;
  faculty?: { _id: string; name: string; email: string };
  facility?: string;
  overallRating: number;
  criteriaRatings: FeedbackCriteria[];
  comments: string;
  suggestions?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  tags: string[];
  status: 'submitted' | 'reviewed' | 'addressed';
  adminNotes?: string;
  createdAt: string;
}

export type GrievanceCategory =
  | 'academic'
  | 'administrative'
  | 'facilities'
  | 'examination'
  | 'harassment_misconduct'
  | 'technical'
  | 'other';

export type GrievancePriority = 'low' | 'medium' | 'high' | 'critical';

export type GrievanceStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'awaiting_student_info'
  | 'resolved'
  | 'closed'
  | 'reopened';

export interface GrievanceAttachment {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}

export interface Grievance {
  _id: string;
  referenceNumber: string;
  title: string;
  description: string;
  category: GrievanceCategory;
  priority: GrievancePriority;
  isSensitive: boolean;
  submissionMode: SubmissionMode;
  student?: { _id: string; name: string; email: string; studentId?: string };
  department?: Department;
  assignedTo?: { _id: string; name: string; email?: string; role: string };
  assignedBy?: { _id: string; name: string };
  status: GrievanceStatus;
  incidentDate?: string;
  location?: string;
  targetResolutionDate?: string;
  resolvedAt?: string;
  closedAt?: string;
  resolutionSummary?: string;
  reopenReason?: string;
  attachments: GrievanceAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface GrievanceUpdate {
  _id: string;
  grievance: string;
  author?: { _id: string; name: string };
  authorRole: 'student' | 'faculty' | 'coordinator' | 'admin' | 'anonymous_student';
  authorName?: string;
  updateType: 'status_change' | 'official_response' | 'student_reply' | 'internal_note' | 'assignment' | 'escalation';
  message: string;
  previousStatus?: string;
  newStatus?: string;
  isInternalOnly: boolean;
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'feedback' | 'grievance' | 'announcement' | 'system';
  relatedId?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  category: 'general' | 'academic' | 'maintenance' | 'event';
  targetDepartment?: Department;
  targetRole: 'all' | 'student' | 'faculty';
  author: { _id: string; name: string; role: string };
  createdAt: string;
}

export interface DashboardMetrics {
  totalStudents: number;
  totalFeedback: number;
  totalGrievances: number;
  openGrievances: number;
  resolvedGrievances: number;
  resolutionRate: number;
  avgResolutionDays: number;
  avgFeedbackRating: number;
  overdueGrievances: number;
}

export interface PeerReviewRatings {
  teamwork: number;
  communication: number;
  problemSolving: number;
  punctuality: number;
  overall: number;
}

export interface ClassmateItem {
  _id: string;
  name: string;
  studentId?: string;
  email: string;
  isReviewed: boolean;
  review?: {
    _id: string;
    ratings: PeerReviewRatings;
    strengths: string[];
    areasForImprovement?: string;
    comments?: string;
    updatedAt: string;
  } | null;
}

export interface ClassmatesResponse {
  classmates: ClassmateItem[];
  totalClassmates: number;
  totalReviewed: number;
  completionPercentage: number;
}

export interface PeerFeedbackItem {
  _id: string;
  ratings: PeerReviewRatings;
  strengths: string[];
  areasForImprovement?: string;
  comments?: string;
  createdAt: string;
  isAnonymous: boolean;
  reviewer?: {
    name: string;
    studentId?: string;
  } | null;
}

export interface PeerFeedbackReport {
  totalReviewsReceived: number;
  averageRatings: PeerReviewRatings | null;
  topStrengths: { tag: string; count: number }[];
  feedbackList: PeerFeedbackItem[];
}

