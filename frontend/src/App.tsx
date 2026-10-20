import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { PublicTrackingPage } from './pages/public/PublicTrackingPage';
import { HelpSupportPage } from './pages/public/HelpSupportPage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage';
import { TermsPage } from './pages/public/TermsPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { SubmitFeedbackPage } from './pages/student/SubmitFeedbackPage';
import { SubmitGrievancePage } from './pages/student/SubmitGrievancePage';
import { MySubmissionsPage } from './pages/student/MySubmissionsPage';
import { PeerReviewPage } from './pages/PeerReviewPage';
import { TimepassPage } from './pages/timepass/TimepassPage';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { AssignedGrievancesPage } from './pages/faculty/AssignedGrievancesPage';
import { FacultyFeedbackPage } from './pages/faculty/FacultyFeedbackPage';

// Admin & Coordinator Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { GrievanceManagementPage } from './pages/admin/GrievanceManagementPage';
import { FeedbackReviewPage } from './pages/admin/FeedbackReviewPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AcademicManagementPage } from './pages/admin/AcademicManagementPage';
import { AnnouncementsPage } from './pages/admin/AnnouncementsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { ReportsPage } from './pages/admin/ReportsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages with Main Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/track" element={<PublicTrackingPage />} />
        <Route path="/help" element={<HelpSupportPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/timepass" element={<div className="p-4 sm:p-8"><TimepassPage /></div>} />
      </Route>

      {/* Student Protected Routes */}
      <Route element={<DashboardLayout allowedRoles={['student']} />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/feedback/new" element={<SubmitFeedbackPage />} />
        <Route path="/student/grievance/new" element={<SubmitGrievancePage />} />
        <Route path="/student/submissions" element={<MySubmissionsPage />} />
        <Route path="/student/peer-review" element={<PeerReviewPage />} />
        <Route path="/student/timepass" element={<TimepassPage />} />
        <Route path="/peer-review" element={<PeerReviewPage />} />
      </Route>

      {/* Faculty Protected Routes */}
      <Route element={<DashboardLayout allowedRoles={['faculty', 'coordinator', 'admin']} />}>
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/grievances" element={<AssignedGrievancesPage />} />
        <Route path="/faculty/feedback" element={<FacultyFeedbackPage />} />
      </Route>

      {/* Admin & Coordinator Protected Routes */}
      <Route element={<DashboardLayout allowedRoles={['coordinator', 'admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/grievances" element={<GrievanceManagementPage />} />
        <Route path="/admin/feedback" element={<FeedbackReviewPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/academics" element={<AcademicManagementPage />} />
        <Route path="/admin/announcements" element={<AnnouncementsPage />} />
        <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
