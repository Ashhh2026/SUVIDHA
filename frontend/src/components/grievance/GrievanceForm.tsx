import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  Paperclip,
  CheckCircle,
  Copy,
  Info,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { GrievanceCategory, GrievancePriority, SubmissionMode, Department } from '../../types';
import { academicApi } from '../../services/academicApi';
import { grievanceApi } from '../../services/grievanceApi';

export const GrievanceForm: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GrievanceCategory>('facilities');
  const [priority, setPriority] = useState<GrievancePriority>('medium');
  const [departmentId, setDepartmentId] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>('identified');

  // Attachments
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');

  // Duplicate warning detection
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    referenceNumber: string;
    trackingToken?: string;
  } | null>(null);

  const [copiedToken, setCopiedToken] = useState(false);

  useEffect(() => {
    academicApi.getDepartments().then((depts) => {
      setDepartments(depts);
      if (depts.length > 0) setDepartmentId(depts[0]._id);
    });
  }, []);

  // Debounced duplicate detection
  useEffect(() => {
    if (title.trim().length > 6 && category) {
      setIsCheckingDuplicates(true);
      const timer = setTimeout(async () => {
        try {
          const found = await grievanceApi.checkDuplicates(category, title, departmentId || undefined);
          setDuplicates(found);
        } catch (_e) {
          setDuplicates([]);
        } finally {
          setIsCheckingDuplicates(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setDuplicates([]);
    }
  }, [title, category, departmentId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Attachment file exceeds 10MB limit.');
      return;
    }

    setAttachmentName(file.name);
    // In demo environment, create an object URL or simulated preview URL
    const url = URL.createObjectURL(file);
    setAttachmentUrl(url);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim().length < 5) {
      setErrorMsg('Title must be at least 5 characters long.');
      return;
    }

    if (description.trim().length < 20) {
      setErrorMsg('Please provide a detailed description (at least 20 characters).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const attachments = attachmentName
        ? [
            {
              fileName: attachmentName,
              fileUrl: attachmentUrl || 'https://suvidha.university.edu/attachments/demo-doc.pdf',
              fileSize: 102400,
              fileType: 'application/pdf',
            },
          ]
        : [];

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        submissionMode,
        department: departmentId || undefined,
        location: location.trim() || undefined,
        incidentDate: incidentDate || undefined,
        attachments,
      };

      const res = await grievanceApi.submit(payload);
      setSubmittedResult({
        referenceNumber: res.referenceNumber,
        trackingToken: res.trackingToken,
      });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit grievance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submittedResult) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-card">
        <div className="w-16 h-16 mx-auto rounded-full bg-teal-100 text-teal-600 dark:bg-teal-950/80 dark:text-teal-400 flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Grievance Registered Successfully</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Your grievance has been assigned reference ID:
        </p>
        <div className="mt-3 inline-block px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-lg font-bold text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-700">
          {submittedResult.referenceNumber}
        </div>

        {/* Anonymous Tracking Token Card */}
        {submittedResult.trackingToken && (
          <div className="mt-6 p-5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-left">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold text-xs uppercase tracking-wider mb-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Important: Save Your Anonymous Tracking Token</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
              Because this grievance is anonymous, your student account is not linked. This tracking token is the <span className="font-bold underline">only way</span> you can track official updates or reply. We cannot recover it for you.
            </p>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 font-mono text-xs font-bold text-slate-900 dark:text-white break-all">
              <span>{submittedResult.trackingToken}</span>
              <button
                onClick={() => copyToClipboard(submittedResult.trackingToken!)}
                className="ml-3 flex items-center gap-1 px-3 py-1.5 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold whitespace-nowrap transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedToken ? 'Copied!' : 'Copy Token'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => navigate('/student/submissions?tab=grievances')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
          >
            Go to Submissions
          </button>
          {submittedResult.trackingToken && (
            <button
              onClick={() => navigate(`/track?token=${submittedResult.trackingToken}`)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
            >
              Test Anonymous Tracking
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {/* Emergency Guidance Notice */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p>
          <span className="font-bold">Administrative Resolution Charter:</span> Suvidha is an official redressal system. Grievances are reviewed within standard university resolution SLAs. For immediate medical, fire, or physical security emergencies, dial Campus Security extension 100.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Lodge an Official Campus Grievance
        </h3>

        {/* Category & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Grievance Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GrievanceCategory)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="academic">Academic & Evaluation</option>
              <option value="examination">Examination Related</option>
              <option value="facilities">Campus Infrastructure & Facilities</option>
              <option value="technical">IT, Software & Wi-Fi</option>
              <option value="administrative">Administrative & Fee Affairs</option>
              <option value="harassment_misconduct">Harassment / Serious Misconduct (Confidential)</option>
              <option value="other">Other Grievance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Urgency / Priority Level <span className="text-rose-500">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as GrievancePriority)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="low">Low (14-day SLA target)</option>
              <option value="medium">Medium (7-day SLA target)</option>
              <option value="high">High (3-day SLA target)</option>
              <option value="critical">Critical (24-hour SLA target)</option>
            </select>
          </div>
        </div>

        {/* Harassment / Sensitive Warning */}
        {category === 'harassment_misconduct' && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Strict Confidentiality Protocol Active:</p>
              <p className="mt-0.5">
                Reports filed under Harassment or Misconduct are routed solely to the Designated University Internal Complaints Committee (ICC). They will never be viewable by normal faculty or the person being reported.
              </p>
            </div>
          </div>
        )}

        {/* Title & Duplicate Warning */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Grievance Subject / Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Lab 402 FPGA Kits Not Connecting, Attendance Record Mismatch"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />

          {/* DUPLICATE WARNING MODAL / INLINE ALERT */}
          {duplicates.length > 0 && (
            <div className="mt-2 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs">
              <p className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                Similar Active Campus Issue Detected:
              </p>
              <ul className="mt-1.5 space-y-1 text-slate-600 dark:text-slate-300">
                {duplicates.map((d) => (
                  <li key={d.referenceNumber} className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-brand-600 font-bold">{d.referenceNumber}:</span>
                    <span className="truncate max-w-xs">{d.title}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded">
                      {d.status}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-slate-500 mt-1">
                If your issue is related to the above, campus staff is already actively resolving it. You may still proceed if your problem is separate.
              </p>
            </div>
          )}
        </div>

        {/* Department & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Concerned Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Exact Location / Room / Block
            </label>
            <input
              type="text"
              placeholder="e.g. Block B, 3rd Floor Lab 304, LH-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Incident Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Date of Incident or Discovery (Optional)
          </label>
          <input
            type="date"
            value={incidentDate}
            onChange={(e) => setIncidentDate(e.target.value)}
            className="w-full sm:w-1/2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {description.length} / 5000 characters (min 20)
            </span>
          </div>
          <textarea
            required
            rows={5}
            value={description}
            placeholder="Clearly explain the issue, when it occurred, who was involved, and what action is needed..."
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Evidence or Supporting Attachment (Optional, max 10MB)
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
              <Paperclip className="w-3.5 h-3.5" />
              Choose File
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
            {attachmentName && (
              <span className="text-xs text-brand-600 dark:text-brand-400 font-medium truncate max-w-xs">
                {attachmentName}
              </span>
            )}
          </div>
        </div>

        {/* Submission Mode Selection */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Submission Privacy Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSubmissionMode('identified')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                submissionMode === 'identified'
                  ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/40 ring-1 ring-brand-500'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">Identified Grievance</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Connected to your student profile. Staff can contact you directly for resolution.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSubmissionMode('anonymous')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                submissionMode === 'anonymous'
                  ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/40 ring-1 ring-brand-500'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">Anonymous Grievance</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Decoupled from your account. An unguessable token will be issued for progress tracking.
              </p>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Registering Grievance...' : 'Submit Grievance'}
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  );
};
