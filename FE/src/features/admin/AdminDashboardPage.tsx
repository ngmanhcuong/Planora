import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/axios';
import type { ApiResponse } from '@/types';
import { BarChart3, CalendarDays, CheckCircle2, Loader2, Search, ShieldCheck, Trash2, UserCog, Users } from 'lucide-react';
import { clsx } from 'clsx';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string;
  _count: {
    tasks: number;
    events: number;
    timetables: number;
    habits: number;
    notifications?: number;
  };
};

type AdminOverview = {
  totals: {
    users: number;
    admins: number;
    verifiedUsers: number;
    tasks: number;
    completedTasks: number;
    events: number;
    timetables: number;
    habits: number;
    notifications: number;
  };
  recentUsers: AdminUser[];
};

export const AdminDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    setError('');
    setIsLoading(true);
    try {
      const [overviewResponse, usersResponse] = await Promise.all([
        apiClient.get<ApiResponse<AdminOverview>>('/admin/overview'),
        apiClient.get<ApiResponse<{ users: AdminUser[] }>>('/admin/users'),
      ]);
      setOverview(overviewResponse.data.data);
      setUsers(usersResponse.data.data.users);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không tải được dữ liệu quản trị.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(keyword));
  }, [search, users]);

  const runUserAction = async (userId: string, action: () => Promise<unknown>) => {
    setActionUserId(userId);
    setError('');
    try {
      await action();
      await loadAdminData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Thao tác quản trị thất bại.');
    } finally {
      setActionUserId(null);
    }
  };

  const stats = overview
    ? [
        { label: 'Tổng người dùng', value: overview.totals.users, icon: Users, tone: 'from-blue-500 to-cyan-400' },
        { label: 'Tài khoản admin', value: overview.totals.admins, icon: ShieldCheck, tone: 'from-violet-500 to-indigo-500' },
        { label: 'Task hoàn thành', value: `${overview.totals.completedTasks}/${overview.totals.tasks}`, icon: CheckCircle2, tone: 'from-emerald-500 to-teal-400' },
        { label: 'Lịch & thời khóa biểu', value: overview.totals.events + overview.totals.timetables, icon: CalendarDays, tone: 'from-amber-500 to-orange-400' },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        <Loader2 className="mr-3 h-6 w-6 animate-spin text-indigo-500" /> Đang tải khu quản trị...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-8 text-white shadow-xl shadow-indigo-950/20">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-indigo-100">
          <ShieldCheck className="h-4 w-4" /> Khu quản trị hệ thống
        </div>
        <h1 className="mt-5 text-4xl font-black tracking-tight">Admin Planora</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100">
          Quản lý người dùng, quyền truy cập và theo dõi dữ liệu vận hành thật của hệ thống. Admin không dùng các chức năng cá nhân như user thường.
        </p>
      </section>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={clsx('mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', item.tone)}>
              <item.icon className="h-6 w-6" />
            </div>
            <p className="text-3xl font-black text-slate-950">{item.value}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xl font-black text-slate-950"><UserCog className="h-5 w-5 text-indigo-600" /> Quản lý tài khoản</div>
            <p className="mt-1 text-sm text-slate-500">Đổi quyền, xác minh, đặt lại mật khẩu hoặc xóa tài khoản user.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên hoặc email..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold outline-none focus:border-indigo-300 focus:bg-white" />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Người dùng</th>
                <th className="px-5 py-4">Quyền</th>
                <th className="px-5 py-4">Dữ liệu</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const busy = actionUserId === user.id;
                return (
                  <tr key={user.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-950">{user.name}</p>
                      <p className="text-xs font-semibold text-slate-500">{user.email}</p>
                      <p className="mt-1 text-[11px] text-slate-400">Tạo: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={clsx('rounded-full px-3 py-1 text-xs font-black', user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600')}>{user.role}</span>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                      <p>{user._count.tasks} task · {user._count.events} sự kiện</p>
                      <p>{user._count.timetables} lịch học · {user._count.habits} thói quen</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={clsx('rounded-full px-3 py-1 text-xs font-bold', user.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>{user.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button disabled={busy} onClick={() => runUserAction(user.id, () => apiClient.patch(`/admin/users/${user.id}/role`, { role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' }))} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                          {user.role === 'ADMIN' ? 'Hạ user' : 'Nâng admin'}
                        </button>
                        <button disabled={busy} onClick={() => runUserAction(user.id, () => apiClient.patch(`/admin/users/${user.id}/verification`, { isVerified: !user.isVerified }))} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                          {user.isVerified ? 'Bỏ xác minh' : 'Xác minh'}
                        </button>
                        <button disabled={busy} onClick={() => {
                          const password = window.prompt('Nhập mật khẩu mới cho tài khoản này, tối thiểu 8 ký tự:');
                          if (password) runUserAction(user.id, () => apiClient.patch(`/admin/users/${user.id}/password`, { password }));
                        }} className="rounded-xl border border-indigo-200 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50">
                          Đặt mật khẩu
                        </button>
                        {user.role !== 'ADMIN' && (
                          <button disabled={busy} onClick={() => {
                            if (window.confirm(`Xóa tài khoản ${user.email}? Dữ liệu liên quan cũng sẽ bị xóa.`)) runUserAction(user.id, () => apiClient.delete(`/admin/users/${user.id}`));
                          }} className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                            <Trash2 className="inline h-3.5 w-3.5" /> Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950"><BarChart3 className="h-5 w-5 text-indigo-600" /> Người dùng mới gần đây</div>
        <div className="grid gap-3 md:grid-cols-3">
          {overview?.recentUsers.map((user) => (
            <div key={user.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="font-bold text-slate-950">{user.name}</p>
              <p className="text-xs font-semibold text-slate-500">{user.email}</p>
              <p className="mt-3 text-xs text-slate-500">{user._count.tasks} task · {user._count.events} sự kiện</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
