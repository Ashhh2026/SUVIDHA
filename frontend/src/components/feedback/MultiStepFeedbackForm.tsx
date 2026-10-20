import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Building,
  FlaskConical,
  Coffee,
  Sparkles,
  Bus,
  Wifi,
  Lightbulb,
  HelpCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  EyeOff,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { StarRating } from './StarRating';
import { FeedbackCategory, SubmissionMode, Department, Course, Subject } from '../../types';
import { academicApi } from '../../services/academicApi';
import { feedbackApi } from '../../services/feedbackApi';

const CATEGORIES: { id: FeedbackCategory; title: string; desc: string; icon: any }[] = [
  { id: 'faculty_teaching', title: 'Faculty & Teaching', desc: 'Lecture clarity, punctuality, and pedagogy', icon: GraduationCap },
  { id: 'course_curriculum', title: 'Course Curriculum', desc: 'Syllabus depth, relevance, and textbooks', icon: BookOpen },
  { id: 'infrastructure_facilities', title: 'Infrastructure & Classrooms', desc: 'Desks, projectors, AC, and lighting', icon: Building },
  { id: 'library_laboratory', title: 'Library & Labs', desc: 'Lab equipment, books, computers, and digital resources', icon: FlaskConical },
  { id: 'hostel_mess', title: 'Hostel & Mess', desc: 'Accommodation, food hygiene, and water supply', icon: Coffee },
  { id: 'campus_cleanliness', title: 'Hygiene & Cleanliness', desc: 'Washrooms, campus grounds, and waste disposal', icon: Sparkles },
  { id: 'it_services', title: 'IT Services & Wi-Fi', desc: 'Campus internet speed, portals, and student email', icon: Wifi },
  { id: 'transport_parking', title: 'Transport & Parking', desc: 'University buses, schedules, and vehicle stands', icon: Bus },
  { id: 'general_suggestions', title: 'General Suggestions', desc: 'Ideas and innovations to improve campus life', icon: Lightbulb },
  { id: 'other', title: 'Other Feedback', desc: 'Any other university-related topics', icon: HelpCircle },
];

const CRITERIA_MAP: Record<string, string[]> = {
  faculty_teaching: ['Lecture Clarity', 'Fairness in Evaluation', 'Doubt Resolution & Availability'],
  course_curriculum: ['Industry Relevance', 'Practical vs Theory Balance', 'Availability of Study Material'],
  library_laboratory: ['Equipment Working Condition', 'Helpfulness of Lab Staff', 'Adequacy of Lab Time'],
  it_services: ['Wi-Fi Coverage in Classrooms', 'Download/Upload Speed', 'Portal Reliability'],
  hostel_mess: ['Food Quality & Hygiene', 'Drinking Water Availability', 'Room Maintenance'],
};

export const MultiStepFeedbackForm: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [facultyMembers, setFacultyMembers] = useState<any[]>([]);

  // Form State
  const [category, setCategory] = useState<FeedbackCategory>('faculty_teaching');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [courseId, setCourseId] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [facultyId, setFacultyId] = useState<string>('');
  const [facility, setFacility] = useState<string>('');

  const [overallRating, setOverallRating] = useState<number>(5);
  const [criteriaRatings, setCriteriaRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string>('');
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>('identified');

  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load departments on mount
  useEffect(() => {
    academicApi.getDepartments().then((depts) => {
      setDepartments(depts);
      if (depts.length > 0) setDepartmentId(depts[0]._id);
    });

    // Check draft
    const saved = localStorage.getItem('suvidha_feedback_draft');
    if (saved) setHasDraft(true);
  }, []);

  // Update courses when department changes
  useEffect(() => {
    if (departmentId) {
      academicApi.getCourses(departmentId).then(setCourses);
      academicApi.getFacultyList(departmentId).then(setFacultyMembers);
    }
  }, [departmentId]);

  // Update subjects when course changes
  useEffect(() => {
    if (courseId) {
      academicApi.getSubjects({ courseId }).then(setSubjects);
    }
  }, [courseId]);

  // Initialize criteria scores when category changes
  useEffect(() => {
    const list = CRITERIA_MAP[category] || ['General Quality', 'Timeliness', 'Staff Responsiveness'];
    const initial: Record<string, number> = {};
    list.forEach((crit) => {
      initial[crit] = 4;
    });
    setCriteriaRatings(initial);
  }, [category]);

  // Save Draft to localStorage
  const saveDraft = () => {
    const draftData = {
      category,
      departmentId,
      courseId,
      subjectId,
      facultyId,
      facility,
      overallRating,
      criteriaRatings,
      comments,
      suggestions,
      submissionMode,
    };
    localStorage.setItem('suvidha_feedback_draft', JSON.stringify(draftData));
    setHasDraft(true);
  };

  const resumeDraft = () => {
    const saved = localStorage.getItem('suvidha_feedback_draft');
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.category) setCategory(d.category);
        if (d.departmentId) setDepartmentId(d.departmentId);
        if (d.courseId) setCourseId(d.courseId);
        if (d.subjectId) setSubjectId(d.subjectId);
        if (d.facultyId) setFacultyId(d.facultyId);
        if (d.facility) setFacility(d.facility);
        if (d.overallRating) setOverallRating(d.overallRating);
        if (d.criteriaRatings) setCriteriaRatings(d.criteriaRatings);
        if (d.comments) setComments(d.comments);
        if (d.suggestions) setSuggestions(d.suggestions);
        if (d.submissionMode) setSubmissionMode(d.submissionMode);
        setHasDraft(false);
      } catch (_e) {
        // Ignore parse error
      }
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('suvidha_feedback_draft');
    setHasDraft(false);
  };

  const handleSubmit = async () => {
    if (comments.trim().length < 10) {
      setErrorMsg('Comments must be at least 10 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const criteriaArray = Object.entries(criteriaRatings).map(([label, score]) => ({
        label,
        score,
      }));

      const payload = {
        category,
        submissionMode,
        department: departmentId || undefined,
        course: courseId || undefined,
        subject: subjectId || undefined,
        faculty: facultyId || undefined,
        facility: facility.trim() || undefined,
        overallRating,
        criteriaRatings: criteriaArray,
        comments: comments.trim(),
        suggestions: suggestions.trim() || undefined,
      };

      const res = await feedbackApi.submit(payload);
      setSubmittedRef(res.referenceNumber);
      clearDraft();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit feedback. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submittedRef) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-card">
        <div className="w-16 h-16 mx-auto rounded-full bg-teal-100 text-teal-600 dark:bg-teal-950/80 dark:text-teal-400 flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Feedback Submitted Successfully!</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Your feedback has been registered with reference ID:
        </p>
        <div className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-lg font-bold text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-700">
          {submittedRef}
        </div>
        <p className="mt-4 text-xs text-slate-500 max-w-md mx-auto">
          {submissionMode === 'anonymous'
            ? 'As selected, this submission is 100% anonymous and your student account is not linked.'
            : 'You can review this submission anytime in your student dashboard history.'}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => navigate('/student/submissions')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
          >
            Go to My Submissions
          </button>
          <button
            onClick={() => {
              setSubmittedRef(null);
              setStep(1);
              setComments('');
              setSuggestions('');
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            Submit Another Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Resume Draft Banner */}
      {hasDraft && step === 1 && (
        <div className="mb-6 p-4 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-brand-800 dark:text-brand-200">
            <RotateCcw className="w-4 h-4 text-brand-600" />
            <span>You have an unsaved draft from a previous session.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resumeDraft}
              className="px-3 py-1 font-semibold rounded bg-brand-600 text-white hover:bg-brand-700"
            >
              Resume Draft
            </button>
            <button
              onClick={clearDraft}
              className="px-3 py-1 font-semibold text-slate-500 hover:text-slate-700"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
          <span>Step {step} of 5: {['Select Category', 'Select Subject / Target', 'Provide Ratings', 'Choose Visibility', 'Review & Submit'][step - 1]}</span>
          <span>{Math.round((step / 5) * 100)}% Completed</span>
        </div>
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 dark:bg-brand-500 transition-all duration-300 rounded-full"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-card">
        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Select Feedback Category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Choose the area of university operations or academics you would like to evaluate.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      saveDraft();
                    }}
                    className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/40 dark:border-brand-500 ring-2 ring-brand-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg ${
                        isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {cat.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {cat.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: TARGET SELECTION */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Select Specific Target
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Help us route your feedback to the relevant department and faculty coordinators.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setCourseId('');
                  setSubjectId('');
                  saveDraft();
                }}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {['faculty_teaching', 'course_curriculum'].includes(category) && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course / Degree
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => {
                      setCourseId(e.target.value);
                      saveDraft();
                    }}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => {
                      setSubjectId(e.target.value);
                      saveDraft();
                    }}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.code}) - Sem {s.semester}
                      </option>
                    ))}
                  </select>
                </div>

                {category === 'faculty_teaching' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Faculty Member
                    </label>
                    <select
                      value={facultyId}
                      onChange={(e) => {
                        setFacultyId(e.target.value);
                        saveDraft();
                      }}
                      className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      <option value="">Select Faculty</option>
                      {facultyMembers.map((f) => (
                        <option key={f._id} value={f._id}>
                          {f.name} ({f.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {!['faculty_teaching', 'course_curriculum'].includes(category) && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Specific Facility / Building / Lab (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Central Library 2nd Floor, CS Lab 3, Boys Hostel B"
                  value={facility}
                  onChange={(e) => {
                    setFacility(e.target.value);
                    saveDraft();
                  }}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 3: RATINGS & WRITTEN FEEDBACK */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Rate & Describe Your Experience
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please provide an honest rating and constructive written evaluation.
              </p>
            </div>

            {/* Overall Rating */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Overall Satisfaction Score</h4>
                <p className="text-xs text-slate-500">How would you rate your overall experience?</p>
              </div>
              <StarRating
                size="lg"
                value={overallRating}
                onChange={(v) => {
                  setOverallRating(v);
                  saveDraft();
                }}
              />
            </div>

            {/* Criteria Sliders */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Category Criteria Assessment
              </h4>
              {Object.keys(criteriaRatings).map((crit) => (
                <div
                  key={crit}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800"
                >
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{crit}</span>
                  <StarRating
                    size="sm"
                    value={criteriaRatings[crit] || 4}
                    onChange={(val) => {
                      setCriteriaRatings((prev) => ({ ...prev, [crit]: val }));
                      saveDraft();
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Written Comments */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Detailed Comments <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {comments.length} / 2000 characters (min 10)
                </span>
              </div>
              <textarea
                rows={4}
                value={comments}
                placeholder="Share specific observations, what worked well, and what could be improved..."
                onChange={(e) => {
                  setComments(e.target.value);
                  saveDraft();
                }}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Suggestions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Constructive Suggestions for Improvement (Optional)
              </label>
              <input
                type="text"
                value={suggestions}
                placeholder="e.g. Include more hands-on labs, provide lecture slides in advance..."
                onChange={(e) => {
                  setSuggestions(e.target.value);
                  saveDraft();
                }}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 4: IDENTITY VISIBILITY MODE */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Choose Submission Privacy Mode
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You have full control over whether your feedback is identified or anonymous.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Identified */}
              <div
                onClick={() => {
                  setSubmissionMode('identified');
                  saveDraft();
                }}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  submissionMode === 'identified'
                    ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/40 dark:border-brand-500 ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Identified Feedback</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Your name and student ID will be visible to authorized faculty and coordinators so they can directly acknowledge your response.
                </p>
                <div className="mt-4 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  Trackable in My Submissions tab
                </div>
              </div>

              {/* Anonymous */}
              <div
                onClick={() => {
                  setSubmissionMode('anonymous');
                  saveDraft();
                }}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  submissionMode === 'anonymous'
                    ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/40 dark:border-brand-500 ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">100% Anonymous Feedback</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Your student identity is completely decoupled in the database. No staff or administrator can identify who submitted it.
                </p>
                <div className="mt-4 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                  Strict cryptographic decoupling guarantee
                </div>
              </div>
            </div>

            {/* Privacy Guarantee Explanation Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <h5 className="font-bold text-slate-900 dark:text-white mb-1">
                How Suvidha Protects Your Privacy:
              </h5>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>When anonymous is selected, the database record has <code className="text-brand-600">student: null</code>.</li>
                <li>Faculty summaries are guarded with minimum sample-size thresholds so small classes cannot deanonymize respondents.</li>
                <li>Anonymous submissions cannot be traced back through administrator export tools.</li>
              </ul>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & SUBMIT */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Review Your Feedback
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please double check your submission before final dispatch.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-slate-900 dark:text-white capitalize">
                  {category.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Overall Score:</span>
                <div className="flex items-center gap-1">
                  <StarRating size="sm" value={overallRating} readOnly />
                  <span className="font-bold text-slate-900 dark:text-white">({overallRating}/5)</span>
                </div>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Privacy Mode:</span>
                <span className={`font-bold uppercase ${submissionMode === 'anonymous' ? 'text-teal-600' : 'text-indigo-600'}`}>
                  {submissionMode}
                </span>
              </div>
              {facility && (
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Facility:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{facility}</span>
                </div>
              )}
              <div className="py-1">
                <span className="text-slate-500 block mb-1">Comments:</span>
                <p className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 italic">
                  "{comments}"
                </p>
              </div>
              {suggestions && (
                <div className="py-1">
                  <span className="text-slate-500 block mb-1">Suggestions:</span>
                  <p className="text-slate-800 dark:text-slate-200">{suggestions}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form Controls */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 3 && comments.trim().length < 10) {
                  setErrorMsg('Please write at least 10 characters in the comments box.');
                  return;
                }
                setErrorMsg(null);
                setStep(step + 1);
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm & Submit Feedback'}
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
