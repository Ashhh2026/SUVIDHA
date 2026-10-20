import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, ShieldCheck, UserX, UserCheck, Edit3 } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { User, UserRole } from '../../types';
import { SkeletonTable } from '../../components/common/SkeletonLoader';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Edit User Modal
  const [editUser, setEditUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isActiveStatus, setIsActiveStatus] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ limit: 100 });
      setUsers(res.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenEdit = (u: User) => {
    setEditUser(u);
    setSelectedRole(u.role);
    setIsActiveStatus(u.isActive);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    setIsUpdating(true);
    try {
      await adminApi.updateUser(editUser._id, {
        role: selectedRole,
        isActive: isActiveStatus,
      });
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.studentId && u.studentId.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonTable rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Administration</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage campus accounts, assign role permissions, and control access statuses.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty Members</option>
            <option value="coordinator">Coordinators</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Identifier</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Verified</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 dark:text-white block">{u.name}</span>
                  </td>
                  <td className="p-3.5 text-slate-500">{u.email}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${
                        u.role === 'admin'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : u.role === 'coordinator'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : u.role === 'faculty'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-500">
                    {u.studentId || u.facultyId || '—'}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        u.isActive ? 'text-teal-600' : 'text-rose-600'
                      }`}
                    >
                      {u.isActive ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[11px] font-medium ${
                        u.isEmailVerified ? 'text-teal-600' : 'text-amber-600'
                      }`}
                    >
                      {u.isEmailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-[11px]"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-elevated">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Edit Account: {editUser.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">{editUser.email}</p>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned System Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty Member</option>
                  <option value="coordinator">Department Coordinator</option>
                  <option value="admin">Campus Administrator</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheckbox"
                  checked={isActiveStatus}
                  onChange={(e) => setIsActiveStatus(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="activeCheckbox" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Account is Active (Uncheck to revoke access and disable login)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
