import { useEffect, useState } from 'react';
import { BarChart3, Briefcase, CheckCircle2, Clock3, Loader2, Plus, RefreshCw, Search, Users } from 'lucide-react';
import { apiClient } from '@/lib/axios';
import type { ApiResponse } from '@/types';

type Member = { id: string; name: string; email: string; role: string; status: string };
type Task = { id: string; title: string; userId: string; status: string; priority: string; dueDate: string };
type Workspace = { members: Member[]; tasks: Task[] };
const roles: Record<string, string> = { ADMIN: 'Quản trị', ENTERPRISE_LEAD: 'Trưởng nhóm', CONTENT_MANAGER: 'Nội dung', CUSTOMER_SUPPORT: 'Hỗ trợ', USER: 'Thành viên' };
const statuses: Record<string, string> = { TODO: 'Chưa bắt đầu', IN_PROGRESS: 'Đang thực hiện', COMPLETED: 'Hoàn thành', OVERDUE: 'Quá hạn' };
const priorities: Record<string, string> = { LOW: 'Thấp', MEDIUM: 'Trung bình', HIGH: 'Cao', URGENT: 'Khẩn cấp' };
const control = 'w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50';
const localDate = () => { const date = new Date(); date.setDate(date.getDate() + 3); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; };
const message = (error: unknown) => (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Không thể kết nối. Vui lòng thử lại.';

export function TeamWorkspace() {
  const [data, setData] = useState<Workspace>({ members: [], tasks: [] });
  const [loading, setLoading] = useState(true);
  const [checkedAt, setCheckedAt] = useState(Date.now);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [role, setRole] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState(localDate);
  const load = async () => {
    setLoading(true); setError('');
    try { const response = await apiClient.get<ApiResponse<Workspace>>('/admin/team'); setData(response.data.data!); setCheckedAt(Date.now()); }
    catch (err) { setError(message(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const members = data.members.filter(member => !role || member.role === role);
  const memberIds = new Set(members.map(member => member.id));
  const tasks = data.tasks.filter(task => memberIds.has(task.userId));
  const completed = tasks.filter(task => task.status === 'COMPLETED').length;
  const overdue = (task: Task) => task.status !== 'COMPLETED' && new Date(task.dueDate).getTime() < checkedAt;
  const visible = tasks.filter(task => (!status || (status === 'OVERDUE' ? overdue(task) : task.status === status)) && `${task.title} ${data.members.find(member => member.id === task.userId)?.name || ''}`.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()));
  const create = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy || !title.trim()) return;
    setBusy('create'); setError(''); setNotice('');
    try {
      const response = await apiClient.post<ApiResponse<{ task: Task }>>('/admin/team/tasks', { title: title.trim(), assigneeId: assignee || undefined, role: role || undefined, priority, dueDate: new Date(`${dueDate}T23:59:59`).toISOString() });
      const task = response.data.data!.task;
      setData(current => ({ ...current, tasks: [task, ...current.tasks] }));
      setTitle(''); setStatus(''); setQuery('');
      setNotice(`Đã giao công việc cho ${data.members.find(member => member.id === task.userId)?.name || 'thành viên'}.`);
    } catch (err) { setError(message(err)); }
    finally { setBusy(''); }
  };
  const update = async (task: Task, nextStatus: string) => {
    setBusy(task.id); setError(''); setNotice('');
    try {
      await apiClient.patch(`/admin/team/tasks/${task.id}`, { status: nextStatus });
      setData(current => ({ ...current, tasks: current.tasks.map(item => item.id === task.id ? { ...item, status: nextStatus } : item) }));
      setNotice('Đã lưu trạng thái công việc.');
    } catch (err) { setError(message(err)); }
    finally { setBusy(''); }
  };
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-bold text-slate-900">Không gian đội ngũ</h2><p className="mt-1 text-sm text-slate-500">Phân công rõ ràng, theo dõi tiến độ từ dữ liệu công việc thực tế.</p></div>
      <button type="button" onClick={() => void load()} disabled={loading || !!busy} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />Làm mới</button>
    </div>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[{ label: 'Thành viên', value: members.length, icon: Users }, { label: 'Tổng công việc', value: tasks.length, icon: Briefcase }, { label: 'Đã hoàn thành', value: completed, icon: CheckCircle2 }, { label: 'Đang quá hạn', value: tasks.filter(overdue).length, icon: Clock3 }].map(item => <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500">{item.label}<item.icon size={17} className="text-indigo-500" /></div><p className="mt-2 text-2xl font-bold text-slate-900">{loading ? '—' : item.value}</p></div>)}
    </div>
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"><label htmlFor="team-role" className="text-sm font-semibold text-slate-600">Nhóm thành viên</label><select id="team-role" className={`${control} sm:!w-56`} value={role} disabled={!!busy} onChange={event => { setRole(event.target.value); setAssignee(''); }}><option value="">Tất cả nhóm</option>{Object.entries(roles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><span className="text-xs text-slate-500">Phân nhóm theo vai trò tài khoản</span></div>
    <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Briefcase size={20} className="text-indigo-600" />Phân công công việc</h3>
        <p className="mt-1 text-sm text-slate-500">Chọn người nhận hoặc tự động cân bằng số việc đang mở.</p>
        <form onSubmit={create} className="my-5 grid gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-xs font-semibold text-slate-600 sm:col-span-2"><span>Tên công việc</span><input required maxLength={200} className={control} placeholder="Ví dụ: Hoàn thiện giao diện trang tổng quan" value={title} onChange={event => setTitle(event.target.value)} /></label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600 sm:col-span-2"><span>Người nhận</span><select className={control} value={assignee} onChange={event => setAssignee(event.target.value)}><option value="">Tự động — chọn thành viên ít việc nhất</option>{members.filter(member => member.status === 'ACTIVE').map(member => <option key={member.id} value={member.id}>{member.name} · {member.email}</option>)}</select></label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600"><span>Mức ưu tiên</span><select className={control} value={priority} onChange={event => setPriority(event.target.value)}>{Object.entries(priorities).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600"><span>Hạn hoàn thành</span><input required type="date" className={control} value={dueDate} onChange={event => setDueDate(event.target.value)} /></label>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2"><p className="max-w-xs text-xs leading-relaxed text-slate-500">Tự động phân công theo khối lượng công việc, chỉ chọn tài khoản đang hoạt động.</p><button type="submit" disabled={loading || !!busy || !title.trim() || !members.some(member => member.status === 'ACTIVE')} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{busy === 'create' ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}{assignee ? 'Giao công việc' : 'Phân công tự động'}</button></div>
        </form>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-slate-900">Danh sách công việc <span className="text-sm font-normal text-slate-400">({visible.length})</span></h3><select aria-label="Lọc trạng thái" className={`${control} sm:!w-44`} value={status} onChange={event => setStatus(event.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div className="relative mb-4"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input aria-label="Tìm công việc hoặc thành viên" className={`${control} !pl-9`} placeholder="Tìm công việc hoặc thành viên..." value={query} onChange={event => setQuery(event.target.value)} /></div>
        {loading ? <p role="status" className="py-10 text-center text-sm text-slate-500">Đang tải công việc...</p> : !visible.length ? <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center"><Briefcase className="mx-auto mb-3 text-slate-300" /><p className="text-sm font-semibold text-slate-600">{tasks.length ? 'Không có công việc phù hợp' : 'Chưa có công việc trong nhóm này'}</p><p className="mt-1 text-xs text-slate-400">{tasks.length ? 'Thử thay đổi từ khóa hoặc bộ lọc.' : 'Tạo công việc đầu tiên bằng biểu mẫu phía trên.'}</p></div> : <div className="max-h-[620px] space-y-3 overflow-y-auto pr-1">{visible.map(task => <article key={task.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><h4 className="min-w-0 break-words text-sm font-semibold text-slate-900">{task.title}</h4><span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold ${['HIGH', 'URGENT'].includes(task.priority) ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>{priorities[task.priority]}</span></div><p className="mt-1 break-words text-xs text-slate-500">{data.members.find(member => member.id === task.userId)?.name || 'Thành viên đã xóa'}</p><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><span className={`text-xs ${overdue(task) ? 'font-semibold text-red-600' : 'text-slate-500'}`}>{overdue(task) ? 'Quá hạn' : 'Hạn'}: {new Date(task.dueDate).toLocaleDateString('vi-VN')}</span><select aria-label={`Trạng thái: ${task.title}`} disabled={!!busy} className={`${control} sm:!w-44`} value={task.status} onChange={event => void update(task, event.target.value)}>{Object.entries(statuses).filter(([value]) => value !== 'OVERDUE' || task.status === 'OVERDUE').map(([value, label]) => <option key={value} value={value} disabled={value === 'OVERDUE'}>{label}</option>)}</select></div></article>)}</div>}
      </section>
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"><h3 className="flex items-center gap-2 text-lg font-bold text-slate-900"><BarChart3 size={20} className="text-indigo-600" />Tiến độ đội ngũ</h3><p className="mt-1 text-sm text-slate-500">Tỷ lệ hoàn thành trên tổng số công việc được giao.</p><div className="my-5 rounded-xl bg-indigo-50 p-4"><div className="flex justify-between text-sm"><span className="font-semibold text-indigo-900">Tiến độ chung</span><strong className="text-indigo-600">{tasks.length ? Math.round(completed / tasks.length * 100) : 0}%</strong></div><progress aria-label="Tiến độ chung" className="mt-3 h-2 w-full accent-indigo-600" max={Math.max(tasks.length, 1)} value={completed} /><p className="mt-2 text-xs text-indigo-600">{completed}/{tasks.length} công việc đã hoàn thành</p></div>
        <div className="max-h-[680px] space-y-3 overflow-y-auto pr-1">{members.map(member => { const assigned = tasks.filter(task => task.userId === member.id); const done = assigned.filter(task => task.status === 'COMPLETED').length; return <article key={member.id} className="rounded-xl border border-slate-100 p-4"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-600">{member.name.slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold text-slate-900">{member.name}</p><p className="break-all text-xs text-slate-500">{member.email}</p><p className="mt-1 text-[11px] text-slate-400">{roles[member.role]} · {member.status === 'ACTIVE' ? 'Tài khoản hoạt động' : 'Tài khoản đã khóa'}</p></div></div><div className="mt-4 flex justify-between text-xs text-slate-500"><span>{assigned.length ? `${done}/${assigned.length} hoàn thành` : 'Chưa được giao việc'}</span><span className="font-bold text-indigo-600">{assigned.length ? `${Math.round(done / assigned.length * 100)}%` : '—'}</span></div><progress aria-label={`Tiến độ ${member.name}`} className="mt-2 h-1.5 w-full accent-indigo-600" max={Math.max(assigned.length, 1)} value={done} /></article>; })}{!loading && !members.length && <p className="py-6 text-center text-sm text-slate-500">Chưa có thành viên trong nhóm này.</p>}</div>
      </section>
    </div>
  </div>;
}
