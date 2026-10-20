import React, { useState, useEffect } from 'react';
import { Building2, BookOpen, GraduationCap, Plus, CheckCircle } from 'lucide-react';
import { academicApi } from '../../services/academicApi';
import { Department, Course, Subject } from '../../types';
import { SkeletonCard } from '../../components/common/SkeletonLoader';

export const AcademicManagementPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab
  const [activeTab, setActiveTab] = useState<'departments' | 'courses' | 'subjects'>('departments');

  // New Department Form
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [isCreatingDept, setIsCreatingDept] = useState(false);
  const [deptModalOpen, setDeptModalOpen] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [depts, crss, subs] = await Promise.all([
        academicApi.getDepartments(),
        academicApi.getCourses(),
        academicApi.getSubjects(),
      ]);
      setDepartments(depts);
      setCourses(crss);
      setSubjects(subs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingDept(true);
    try {
      await academicApi.createDepartment({
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        description: deptDesc.trim(),
      });
      setDeptModalOpen(false);
      setDeptName('');
      setDeptCode('');
      setDeptDesc('');
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create department.');
    } finally {
      setIsCreatingDept(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Academic Structure</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure campus departments, academic programs, courses, and subject allocations.
          </p>
        </div>
        {activeTab === 'departments' && (
          <button
            onClick={() => setDeptModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-8">
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 ${
            activeTab === 'departments'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-500'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Departments ({departments.length})
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 ${
            activeTab === 'courses'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-500'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Degrees & Courses ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 ${
            activeTab === 'subjects'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-500'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Subjects ({subjects.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((d) => (
            <div
              key={d._id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-card space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-600 px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950">
                  {d.code}
                </span>
                <span className="text-[11px] font-semibold text-teal-600">Active</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{d.name}</h3>
              <p className="text-xs text-slate-500">{d.description || 'No description provided.'}</p>
              {d.coordinator && (
                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  Coordinator: <strong className="text-slate-700 dark:text-slate-200">{d.coordinator.name}</strong>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((c) => (
            <div
              key={c._id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-card space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-600 px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950">
                  {c.code}
                </span>
                <span className="text-xs text-slate-400">{c.durationYears} Years ({c.totalSemesters} Semesters)</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{c.name}</h3>
              <p className="text-xs text-slate-500">
                Department: {(c.department as any)?.name || 'Campus Wide'}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Subject Name</th>
                <th className="p-3.5">Semester</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Assigned Faculty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {subjects.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono font-bold text-brand-600">{s.code}</td>
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{s.name}</td>
                  <td className="p-3.5">Sem {s.semester}</td>
                  <td className="p-3.5">{(s.department as any)?.code || 'CSE'}</td>
                  <td className="p-3.5 font-medium">
                    {s.faculty && s.faculty.length > 0 ? s.faculty.map((f) => f.name).join(', ') : 'None'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Department Modal */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-elevated">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Add Academic Department
            </h3>
            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Information Technology"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IT"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={deptDesc}
                  placeholder="Department focus and research laboratories..."
                  onChange={(e) => setDeptDesc(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeptModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingDept}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
                >
                  {isCreatingDept ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
