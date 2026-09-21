import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '@/lib/axios';
import type { ApiResponse } from '@/types';
import {
  BarChart3,
  BellRing,
  Bot,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  Headphones,
  Layers,
  Loader2,
  Megaphone,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Tags,
  Trash2,
  UserCog,
  Users,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';

type Role = 'USER' | 'ADMIN' | 'CONTENT_MANAGER' | 'CUSTOMER_SUPPORT' | 'ENTERPRISE_LEAD';
type Tier = 'FREE' | 'PREMIUM' | 'VIP' | 'INTERNAL';
type Status = 'ACTIVE' | 'LOCKED';
type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
type CategoryType = 'STUDY' | 'WORK' | 'TASK' | 'MEETING' | 'PERSONAL' | 'HABIT' | 'DEADLINE';
type ContentType = 'HANDBOOK' | 'HOMEPAGE' | 'BANNER';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  accountTier: Tier;
  status: Status;
  isVerified: boolean;
  lastActiveAt?: string | null;
  createdAt: string;
  _count: { tasks: number; events: number; timetables: number; habits: number; notifications: number; supportTickets: number };
};
type Ticket = { id: string; subject: string; message: string; status: TicketStatus; adminReply?: string | null; createdAt: string; user: { id: string; name: string; email: string } };
type Config = { id: string; key: string; label: string; value: string; description?: string | null };
type Template = { id: string; name: string; type: CategoryType; color: string; bgColor: string; textColor: string; description?: string | null; isActive: boolean };
type Campaign = { id: string; title: string; message: string; audience?: Tier | null; status: 'DRAFT' | 'SENT'; recipientsCount: number; scheduledAt?: string | null; sentAt?: string | null; createdAt: string };
type Content = { id: string; type: ContentType; title: string; body: string; isPublished: boolean; updatedAt: string };
type Analytics = { daily: { date: string; activeUsers: number; createdTasks: number; completedTasks: number; events: number }[]; featureUsage: Record<string, number> };
type Overview = { totals: Record<string, number>; recentUsers: AdminUser[]; recentTickets: Ticket[] };

type AdminData = { overview: Overview; analytics: Analytics; users: AdminUser[]; tickets: Ticket[]; configs: Config[]; templates: Template[]; campaigns: Campaign[]; contents: Content[] };

type TeamTask = { id: string; title: string; assignee: string; department: string; status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'; priority: 'LOW' | 'MEDIUM' | 'HIGH' };

const roleLabels: Record<Role, string> = {
  ADMIN: 'Quản trị hệ thống',
  CONTENT_MANAGER: 'Quản lý nội dung / Kiểm duyệt',
  CUSTOMER_SUPPORT: 'Chăm sóc khách hàng (CS)',
  ENTERPRISE_LEAD: 'Doanh nghiệp / Team Lead',
  USER: 'Người dùng cá nhân',
};

const roleBadgeColors: Record<Role, string> = {
  ADMIN: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  CONTENT_MANAGER: 'bg-amber-100 text-amber-800 border-amber-200',
  CUSTOMER_SUPPORT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  ENTERPRISE_LEAD: 'bg-purple-100 text-purple-800 border-purple-200',
  USER: 'bg-slate-100 text-slate-700 border-slate-200',
};

const tierLabels: Record<Tier, string> = { FREE: 'Miễn phí', PREMIUM: 'Cao cấp (Premium)', VIP: 'VIP', INTERNAL: 'Nội bộ' };
const statusLabels: Record<Status, string> = { ACTIVE: 'Đang hoạt động', LOCKED: 'Đã khóa' };
const ticketLabels: Record<TicketStatus, string> = { OPEN: 'Mới', IN_PROGRESS: 'Đang xử lý', RESOLVED: 'Đã giải quyết' };

const tabs = [
  { id: 'users', label: '1. Quản trị hệ thống', icon: ShieldCheck, badge: 'Full Admin' },
  { id: 'content', label: '2. Quản lý nội dung / Kiểm duyệt', icon: FileText, badge: 'Moderator' },
  { id: 'support', label: '3. Chăm sóc khách hàng (CS)', icon: Headphones, badge: 'Support Desk' },
  { id: 'team', label: '4. Doanh nghiệp & Team Lead', icon: Users, badge: 'Enterprise' },
  { id: 'system', label: 'Cấu hình AI & Tự động hóa', icon: Bot, badge: 'System' },
] as const;

type TabId = typeof tabs[number]['id'];

const emptyUserForm = { name: '', email: '', password: '', role: 'USER' as Role, accountTier: 'FREE' as Tier, status: 'ACTIVE' as Status };
const emptyTicketForm = { userId: '', subject: '', message: '' };
const emptyConfigForm = { key: 'ai.schedule.maxSessions', label: 'Số phiên gợi ý tối đa', value: '5', description: 'Thông số thật dùng để điều chỉnh thuật toán gợi ý lịch.' };
const emptyTemplateForm = { name: '', type: 'TASK' as CategoryType, color: '#4F46E5', bgColor: '#E2DFFF', textColor: '#3323CC', description: '', isActive: true };
const emptyCampaignForm = { title: '', message: '', audience: '' as '' | Tier, sendNow: true };
const emptyContentForm = { type: 'HANDBOOK' as ContentType, title: '', body: '', isPublished: false };

export const AdminDashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabId) || 'users';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  const [data, setData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const [userForm, setUserForm] = useState(emptyUserForm);
  const [ticketForm, setTicketForm] = useState(emptyTicketForm);
  const [configForm, setConfigForm] = useState(emptyConfigForm);
  const [templateForm, setTemplateForm] = useState(emptyTemplateForm);
  const [campaignForm, setCampaignForm] = useState(emptyCampaignForm);
  const [contentForm, setContentForm] = useState(emptyContentForm);

  // CS Lookup User
  const [selectedCsUser, setSelectedCsUser] = useState<AdminUser | null>(null);

  // Team Lead Demo State
  const [teamMembers, setTeamMembers] = useState([
    { id: 'tm1', name: 'Nguyễn Văn An', role: 'Developer', tasksCompleted: 14, totalTasks: 18, efficiency: 92 },
    { id: 'tm2', name: 'Trần Thị Bình', role: 'Designer', tasksCompleted: 9, totalTasks: 10, efficiency: 95 },
    { id: 'tm3', name: 'Lê Hoàng Cường', role: 'Marketer', tasksCompleted: 6, totalTasks: 12, efficiency: 80 },
  ]);

  const [teamTasks, setTeamTasks] = useState<TeamTask[]>([
    { id: 'tt1', title: 'Thiết kế giao diện Báo cáo tuần', assignee: 'Trần Thị Bình', department: 'Design', status: 'IN_PROGRESS', priority: 'HIGH' },
    { id: 'tt2', title: 'Tối ưu thuật toán gợi ý thời gian AI', assignee: 'Nguyễn Văn An', department: 'Engineering', status: 'COMPLETED', priority: 'HIGH' },
    { id: 'tt3', title: 'Chuẩn bị bài đăng bài học quản lý thời gian', assignee: 'Lê Hoàng Cường', department: 'Marketing', status: 'TODO', priority: 'MEDIUM' },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Nguyễn Văn An');
  const [newTaskDepartment, setNewTaskDepartment] = useState('Engineering');

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as TabId;
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const loadAdminData = async () => {
    setError('');
    setIsLoading(true);
    try {
      const [overview, analytics, users, tickets, configs, templates, campaigns, contents] = await Promise.all([
        apiClient.get<ApiResponse<Overview>>('/admin/overview'),
        apiClient.get<ApiResponse<Analytics>>('/admin/analytics'),
        apiClient.get<ApiResponse<{ users: AdminUser[] }>>('/admin/users'),
        apiClient.get<ApiResponse<{ tickets: Ticket[] }>>('/admin/support/tickets'),
        apiClient.get<ApiResponse<{ configs: Config[] }>>('/admin/system/configs'),
        apiClient.get<ApiResponse<{ templates: Template[] }>>('/admin/system/category-templates'),
        apiClient.get<ApiResponse<{ campaigns: Campaign[] }>>('/admin/notification-campaigns'),
        apiClient.get<ApiResponse<{ contents: Content[] }>>('/admin/content'),
      ]);
      setData({
        overview: overview.data.data,
        analytics: analytics.data.data,
        users: users.data.data.users,
        tickets: tickets.data.data.tickets,
        configs: configs.data.data.configs,
        templates: templates.data.data.templates,
        campaigns: campaigns.data.data.campaigns,
        contents: contents.data.data.contents,
      });
      if (users.data.data.users.length > 0) {
        setSelectedCsUser(users.data.data.users[0]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không tải được dữ liệu quản trị.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadAdminData(); }, []);

  const runAction = async (action: () => Promise<unknown>, reset?: () => void) => {
    setIsSaving(true); setError('');
    try {
      await action();
      reset?.();
      await loadAdminData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Thao tác thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  const users = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    let rows = data?.users || [];
    if (roleFilter !== 'ALL') {
      rows = rows.filter((u) => u.role === roleFilter);
    }
    if (!keyword) return rows;
    return rows.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(keyword));
  }, [data?.users, search, roleFilter]);

  const handleCreateTeamTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const task: TeamTask = {
      id: `tt_${Date.now()}`,
      title: newTaskTitle.trim(),
      assignee: newTaskAssignee,
      department: newTaskDepartment,
      status: 'TODO',
      priority: 'HIGH',
    };
    setTeamTasks([task, ...teamTasks]);
    setNewTaskTitle('');
  };

  if (isLoading || !data) return (
    <div className="flex min-h-[60vh] items-center justify-center text-slate-500 font-medium">
      <Loader2 className="mr-3 h-6 w-6 animate-spin text-indigo-600" /> Đang tải khu quản trị Planora...
    </div>
  );

  const statCards = [
    { label: 'Tổng người dùng', value: data.overview.totals.users, icon: Users, color: 'from-sky-500 to-blue-600' },
    { label: 'DAU / MAU', value: `${data.overview.totals.dau}/${data.overview.totals.mau}`, icon: BarChart3, color: 'from-violet-500 to-indigo-600' },
    { label: 'Ticket CS đang mở', value: data.overview.totals.openTickets, icon: Headphones, color: 'from-emerald-500 to-teal-600' },
    { label: 'Thông báo & Mẹo gửi', value: data.overview.totals.notifications, icon: BellRing, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-8 text-white shadow-xl shadow-indigo-950/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-indigo-100 backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-indigo-400" /> Hệ thống phân quyền 4 vai trò Planora
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Quản trị & Phân quyền người dùng</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-indigo-200">
              Điều hành linh hoạt 4 vai trò chính: Quản trị viên hệ thống, Quản lý nội dung & Kiểm duyệt viên, Chăm sóc khách hàng (CS), và Người dùng cao cấp / Enterprise Team Lead.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold backdrop-blur-md">
              🔑 {data.users.length} Tài khoản hệ thống
            </span>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Stats row */}
      <section className="grid gap-4 md:grid-cols-4">
        {statCards.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </section>

      {/* 4 Roles Navigation Bar */}
      <section className="flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={clsx(
              'flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-black transition-all duration-200',
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <tab.icon className="h-4 w-4 shrink-0" />
            <span>{tab.label}</span>
          </button>
        ))}
      </section>

      {/* TAB 1: Quản trị hệ thống (System Admin) */}
      {activeTab === 'users' && (
        <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
          <Panel title="Tạo tài khoản & Phân quyền" icon={Plus} subtitle="Khởi tạo tài khoản và gán 1 trong 4 vai trò quản trị.">
            <div className="grid gap-3.5">
              <TextInput placeholder="Tên người dùng" value={userForm.name} onChange={(v) => setUserForm({ ...userForm, name: v })} />
              <TextInput placeholder="Email" value={userForm.email} onChange={(v) => setUserForm({ ...userForm, email: v })} />
              <TextInput placeholder="Mật khẩu" type="password" value={userForm.password} onChange={(v) => setUserForm({ ...userForm, password: v })} />

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">Chọn vai trò hệ thống:</label>
                <Select
                  value={userForm.role}
                  onChange={(v) => setUserForm({ ...userForm, role: v as Role })}
                  options={['USER', 'ADMIN', 'CONTENT_MANAGER', 'CUSTOMER_SUPPORT', 'ENTERPRISE_LEAD']}
                  labels={roleLabels}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">Gói tài khoản:</label>
                  <Select value={userForm.accountTier} onChange={(v) => setUserForm({ ...userForm, accountTier: v as Tier })} options={['FREE', 'PREMIUM', 'VIP', 'INTERNAL']} labels={tierLabels} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">Trạng thái:</label>
                  <Select value={userForm.status} onChange={(v) => setUserForm({ ...userForm, status: v as Status })} options={['ACTIVE', 'LOCKED']} labels={statusLabels} />
                </div>
              </div>

              <PrimaryButton disabled={isSaving} onClick={() => runAction(() => apiClient.post('/admin/users', userForm), () => setUserForm(emptyUserForm))}>
                + Tạo & Gán vai trò
              </PrimaryButton>
            </div>
          </Panel>

          <Panel title="Quản lý & Phân loại người dùng" icon={Users} subtitle="Tìm kiếm, phân quyền 4 vai trò, kiểm tra trạng thái xác minh & kích hoạt.">
            {/* Filter by role */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Lọc theo vai trò:</span>
              <FilterPill label="Tất cả" active={roleFilter === 'ALL'} onClick={() => setRoleFilter('ALL')} />
              <FilterPill label="Quản trị viên (Admin)" active={roleFilter === 'ADMIN'} onClick={() => setRoleFilter('ADMIN')} />
              <FilterPill label="Kiểm duyệt viên" active={roleFilter === 'CONTENT_MANAGER'} onClick={() => setRoleFilter('CONTENT_MANAGER')} />
              <FilterPill label="Chăm sóc CS" active={roleFilter === 'CUSTOMER_SUPPORT'} onClick={() => setRoleFilter('CUSTOMER_SUPPORT')} />
              <FilterPill label="Enterprise / Team Lead" active={roleFilter === 'ENTERPRISE_LEAD'} onClick={() => setRoleFilter('ENTERPRISE_LEAD')} />
              <FilterPill label="Người dùng" active={roleFilter === 'USER'} onClick={() => setRoleFilter('USER')} />
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc email..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
              />
            </div>

            <div className="space-y-3">
              {users.map((user) => (
                <UserRow key={user.id} user={user} onAction={runAction} />
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 2: Quản lý nội dung / Kiểm duyệt viên (Content Manager / Moderator) */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <RoleBanner
            roleTitle="1. Quản lý nội dung / Kiểm duyệt viên (Content Manager / Moderator)"
            description="Chịu trách nhiệm đăng tải & chỉnh sửa bài viết hướng dẫn mẹo quản lý thời gian, thông báo hệ thống, đồng thời kiểm duyệt hoặc gỡ bỏ các mẫu lập kế hoạch (templates) công khai vi phạm tiêu chuẩn cộng đồng."
            badgeColor="bg-amber-500 text-white"
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel title="Đăng bài viết & Thông báo hệ thống" icon={FileText} subtitle="Tạo bài viết Handbook hoặc Banner thông báo ứng dụng.">
              <div className="mb-5 grid gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">Loại nội dung:</label>
                  <Select value={contentForm.type} onChange={(v) => setContentForm({ ...contentForm, type: v as ContentType })} options={['HANDBOOK', 'HOMEPAGE', 'BANNER']} labels={{ HANDBOOK: 'Handbook / Cẩm nang', HOMEPAGE: 'Trang chủ', BANNER: 'Banner quảng bá' }} />
                </div>
                <TextInput placeholder="Tiêu đề bài viết / thông báo" value={contentForm.title} onChange={(v) => setContentForm({ ...contentForm, title: v })} />
                <TextArea placeholder="Nội dung bài viết, chia sẻ mẹo quản lý thời gian..." value={contentForm.body} onChange={(v) => setContentForm({ ...contentForm, body: v })} />
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={contentForm.isPublished} onChange={(e) => setContentForm({ ...contentForm, isPublished: e.target.checked })} className="rounded" />
                  Xuất bản công khai lập tức
                </label>
                <PrimaryButton disabled={isSaving} onClick={() => runAction(() => apiClient.post('/admin/content', contentForm), () => setContentForm(emptyContentForm))}>
                  Đăng / Lưu nội dung
                </PrimaryButton>
              </div>

              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Bài viết đã tạo</h3>
              <List
                rows={data.contents.map((c) => ({
                  id: c.id,
                  title: c.title,
                  meta: `${c.type} · ${c.isPublished ? 'Đã xuất bản' : 'Bản nháp'}`,
                  desc: c.body,
                  onDelete: () => runAction(() => apiClient.delete(`/admin/content/${c.id}`)),
                }))}
              />
            </Panel>

            <Panel title="Kiểm duyệt Mẫu lập kế hoạch (Templates)" icon={Tags} subtitle="Kiểm duyệt và gỡ bỏ các mẫu lập kế hoạch do người dùng đóng góp.">
              <div className="mb-5 grid gap-3">
                <TextInput placeholder="Tên mẫu lập kế hoạch" value={templateForm.name} onChange={(v) => setTemplateForm({ ...templateForm, name: v })} />
                <Select value={templateForm.type} onChange={(v) => setTemplateForm({ ...templateForm, type: v as CategoryType })} options={['STUDY', 'WORK', 'TASK', 'MEETING', 'PERSONAL', 'HABIT', 'DEADLINE']} />
                <TextInput placeholder="Mô tả mẫu" value={templateForm.description} onChange={(v) => setTemplateForm({ ...templateForm, description: v })} />
                <PrimaryButton disabled={isSaving} onClick={() => runAction(() => apiClient.post('/admin/system/category-templates', templateForm), () => setTemplateForm(emptyTemplateForm))}>
                  + Tạo mẫu chuẩn
                </PrimaryButton>
              </div>

              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Danh sách mẫu công khai</h3>
              <List
                rows={data.templates.map((t) => ({
                  id: t.id,
                  title: t.name,
                  meta: `${t.type} · ${t.isActive ? 'Đang bật / Đã duyệt' : 'Chờ kiểm duyệt'}`,
                  desc: t.description || '',
                  onDelete: () => runAction(() => apiClient.delete(`/admin/system/category-templates/${t.id}`)),
                  actionLabel: <span className="text-rose-600 font-bold">Gỡ bỏ</span>,
                }))}
              />
            </Panel>
          </div>

          <Panel title="Gửi thông báo & Mẹo quản lý thời gian" icon={Megaphone} subtitle="Tạo chiến dịch gửi thông báo mẹo quản lý thời gian tới người dùng.">
            <div className="mb-5 grid gap-3 md:grid-cols-2">
              <TextInput placeholder="Tiêu đề thông báo" value={campaignForm.title} onChange={(v) => setCampaignForm({ ...campaignForm, title: v })} />
              <Select value={campaignForm.audience} onChange={(v) => setCampaignForm({ ...campaignForm, audience: v as '' | Tier })} options={['', 'FREE', 'PREMIUM', 'VIP', 'INTERNAL']} labels={{ '': 'Tất cả tài khoản', FREE: 'Miễn phí', PREMIUM: 'Cao cấp', VIP: 'VIP', INTERNAL: 'Nội bộ' }} />
              <div className="md:col-span-2">
                <TextArea placeholder="Nội dung mẹo quản lý thời gian..." value={campaignForm.message} onChange={(v) => setCampaignForm({ ...campaignForm, message: v })} />
              </div>
              <PrimaryButton disabled={isSaving} onClick={() => runAction(() => apiClient.post('/admin/notification-campaigns', { ...campaignForm, audience: campaignForm.audience || null }), () => setCampaignForm(emptyCampaignForm))}>
                Gửi thông báo cộng đồng
              </PrimaryButton>
            </div>
            <List
              rows={data.campaigns.map((c) => ({
                id: c.id,
                title: c.title,
                meta: `${c.status} · ${c.recipientsCount} người nhận`,
                desc: c.message,
                onDelete: c.status === 'DRAFT' ? () => runAction(() => apiClient.post(`/admin/notification-campaigns/${c.id}/send`)) : undefined,
                actionLabel: 'Gửi ngay',
              }))}
            />
          </Panel>
        </div>
      )}

      {/* TAB 3: Chăm sóc khách hàng / Hỗ trợ viên (Customer Support / CS) */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <RoleBanner
            roleTitle="2. Chăm sóc khách hàng / Hỗ trợ viên (Customer Support / CS)"
            description="Hỗ trợ giải đáp thắc mắc, tiếp nhận ticket khiếu nại, phản hồi sự cố kỹ thuật cho người dùng (đặc biệt các gói trả phí Premium/VIP). Xem trạng thái tài khoản cơ bản để hướng dẫn khách hàng khắc phục lỗi."
            badgeColor="bg-emerald-500 text-white"
          />

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            {/* Ticket Management Panel */}
            <Panel title="Trung tâm Tiếp nhận & Phản hồi Ticket" icon={Headphones} subtitle="Tiếp nhận và xử lý sự cố kỹ thuật của người dùng.">
              <div className="mb-5 grid gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <h3 className="text-xs font-bold uppercase text-slate-600">Tạo ticket hỗ trợ mới cho khách hàng:</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <Select value={ticketForm.userId} onChange={(v) => setTicketForm({ ...ticketForm, userId: v })} options={data.users.map((u) => u.id)} labels={Object.fromEntries(data.users.map((u) => [u.id, `${u.name} (${u.email})`]))} />
                  <TextInput placeholder="Chủ đề sự cố" value={ticketForm.subject} onChange={(v) => setTicketForm({ ...ticketForm, subject: v })} />
                </div>
                <TextInput placeholder="Mô tả sự cố người dùng gặp phải..." value={ticketForm.message} onChange={(v) => setTicketForm({ ...ticketForm, message: v })} />
                <PrimaryButton disabled={isSaving} onClick={() => runAction(() => apiClient.post('/admin/support/tickets', ticketForm), () => setTicketForm(emptyTicketForm))}>
                  + Mở ticket hỗ trợ
                </PrimaryButton>
              </div>

              <div className="space-y-3">
                {data.tickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} onAction={runAction} />
                ))}
              </div>
            </Panel>

            {/* Account Inspector for CS Staff */}
            <Panel title="Tra cứu Trạng thái Tài khoản CS" icon={UserCog} subtitle="Xem thông tin tài khoản cơ bản để hướng dẫn khách hàng mà không cần quyền Admin tối cao.">
              <div className="mb-4">
                <label className="mb-1 block text-xs font-bold text-slate-600">Chọn tài khoản khách hàng tra cứu:</label>
                <Select
                  value={selectedCsUser?.id || ''}
                  onChange={(v) => setSelectedCsUser(data.users.find((u) => u.id === v) || null)}
                  options={data.users.map((u) => u.id)}
                  labels={Object.fromEntries(data.users.map((u) => [u.id, `${u.name} - ${u.email}`]))}
                />
              </div>

              {selectedCsUser ? (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                    <div>
                      <h3 className="text-base font-black text-slate-900">{selectedCsUser.name}</h3>
                      <p className="text-xs text-slate-500">{selectedCsUser.email}</p>
                    </div>
                    <span className={clsx('rounded-full px-3 py-1 text-xs font-black border', roleBadgeColors[selectedCsUser.role])}>
                      {roleLabels[selectedCsUser.role]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                    <div className="rounded-xl bg-white p-3 border border-indigo-100">
                      <span className="text-slate-400">Gói tài khoản:</span>
                      <p className="text-indigo-600 font-bold mt-0.5">{tierLabels[selectedCsUser.accountTier]}</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-indigo-100">
                      <span className="text-slate-400">Trạng thái:</span>
                      <p className="text-emerald-600 font-bold mt-0.5">{statusLabels[selectedCsUser.status]}</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-indigo-100">
                      <span className="text-slate-400">Số Task đã tạo:</span>
                      <p className="text-slate-900 font-bold mt-0.5">{selectedCsUser._count.tasks} công việc</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-indigo-100">
                      <span className="text-slate-400">Sự kiện & Lịch:</span>
                      <p className="text-slate-900 font-bold mt-0.5">{selectedCsUser._count.events} sự kiện</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-3 border border-indigo-100 text-xs">
                    <span className="text-slate-400">Đăng nhập gần nhất:</span>
                    <p className="font-bold text-slate-700 mt-0.5">
                      {selectedCsUser.lastActiveAt ? new Date(selectedCsUser.lastActiveAt).toLocaleString('vi-VN') : 'Chưa có dữ liệu'}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
                    💡 <strong>Hướng dẫn CS:</strong> Hãy nhắc khách hàng kiểm tra mục Cài đặt thông báo nếu không nhận được nhắc nhở deadline.
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Chưa chọn tài khoản.</p>
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* TAB 4: Người dùng cao cấp / Doanh nghiệp / Team Lead (Premium / Enterprise / Team Lead) */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <RoleBanner
            roleTitle="3. Người dùng cao cấp / Doanh nghiệp (Premium User / Enterprise / Team Lead)"
            description="Không gian dành cho cá nhân cao cấp hoặc các nhóm làm việc/doanh nghiệp. Tạo nhóm làm việc, phân công công việc tự động cho các thành viên, theo dõi tiến độ công việc chung phòng ban, mở khóa các tính năng tự động hóa nâng cao & phân tích hiệu suất sâu."
            badgeColor="bg-purple-600 text-white"
          />

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            {/* Auto Task Assignment & Progress Tracker */}
            <Panel title="Phân công công việc tự động & Theo dõi tiến độ" icon={Briefcase} subtitle="Tạo việc và giao tự động cho các thành viên trong nhóm làm việc.">
              <form onSubmit={handleCreateTeamTask} className="mb-5 grid gap-3 rounded-2xl bg-purple-50/50 p-4 border border-purple-100 md:grid-cols-3">
                <div className="md:col-span-3">
                  <TextInput placeholder="Tên công việc phân công cho team..." value={newTaskTitle} onChange={setNewTaskTitle} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">Thành viên nhận việc:</label>
                  <Select value={newTaskAssignee} onChange={setNewTaskAssignee} options={teamMembers.map((m) => m.name)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">Phòng ban:</label>
                  <Select value={newTaskDepartment} onChange={setNewTaskDepartment} options={['Engineering', 'Design', 'Marketing', 'Product']} />
                </div>
                <div className="flex items-end">
                  <PrimaryButton onClick={() => {}}>+ Phân công tự động</PrimaryButton>
                </div>
              </form>

              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tiến độ công việc nhóm</h3>
              <div className="space-y-3">
                {teamTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">{task.department}</span>
                        <span className="text-xs font-bold text-slate-900">{task.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">Phân công: <strong>{task.assignee}</strong></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={clsx('rounded-full px-2.5 py-1 text-[11px] font-bold', task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : task.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700')}>
                        {task.status === 'COMPLETED' ? 'Đã hoàn thành' : task.status === 'IN_PROGRESS' ? 'Đang thực hiện' : 'Chưa bắt đầu'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Department Performance & Advanced Analytics */}
            <Panel title="Phân tích Hiệu suất Sâu (Advanced Analytics)" icon={BarChart3} subtitle="Báo cáo tiến độ và hiệu suất công việc từng thành viên.">
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-bold text-sm text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.role}</p>
                      </div>
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
                        {member.efficiency}% Hiệu suất
                      </span>
                    </div>
                    <div className="mb-1 flex justify-between text-xs text-slate-500 font-semibold">
                      <span>Tiến độ hoàn thành</span>
                      <span>{member.tasksCompleted}/{member.totalTasks} công việc</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${(member.tasksCompleted / member.totalTasks) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-900 p-5 text-white">
                <div className="flex items-center gap-2 font-bold text-xs text-purple-200">
                  <Zap className="h-4 w-4 text-amber-400" /> Tính năng tự động hóa nâng cao đã mở khóa
                </div>
                <p className="mt-2 text-xs leading-relaxed text-purple-100">
                  Thuật toán AI tự động điều phối khối lượng công việc, phát hiện điểm nghẽn tiến độ phòng ban và đề xuất khung giờ tập trung cao nhất cho team.
                </p>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* TAB SYSTEM CONFIGS */}
      {activeTab === 'system' && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Cấu hình AI / Tự động hóa" icon={Bot} subtitle="Tinh chỉnh thông số gợi ý lịch trình thông minh.">
            <div className="mb-5 grid gap-3 md:grid-cols-2">
              <TextInput placeholder="Khóa cấu hình" value={configForm.key} onChange={(v) => setConfigForm({ ...configForm, key: v })} />
              <TextInput placeholder="Tên hiển thị" value={configForm.label} onChange={(v) => setConfigForm({ ...configForm, label: v })} />
              <TextInput placeholder="Giá trị" value={configForm.value} onChange={(v) => setConfigForm({ ...configForm, value: v })} />
              <TextInput placeholder="Mô tả" value={configForm.description} onChange={(v) => setConfigForm({ ...configForm, description: v })} />
              <PrimaryButton disabled={isSaving} onClick={() => runAction(() => apiClient.post('/admin/system/configs', configForm), () => setConfigForm(emptyConfigForm))}>
                Lưu cấu hình
              </PrimaryButton>
            </div>
            <List rows={data.configs.map((c) => ({ id: c.id, title: c.label, meta: `${c.key} = ${c.value}`, desc: c.description || '', onDelete: () => runAction(() => apiClient.delete(`/admin/system/configs/${c.id}`)) }))} />
          </Panel>
          <Panel title="Phân tích dùng tính năng" icon={Settings2} subtitle="Tổng hợp dữ liệu thật theo module.">
            <List rows={Object.entries(data.analytics.featureUsage).map(([key, value]) => ({ id: key, title: key, meta: `${value}`, desc: 'Lượt dữ liệu đã phát sinh' }))} />
          </Panel>
        </div>
      )}
    </div>
  );
};

/* Helper Components */
const RoleBanner = ({ roleTitle, description, badgeColor }: { roleTitle: string; description: string; badgeColor: string }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-3">
      <span className={clsx('rounded-xl px-3 py-1 text-xs font-black uppercase tracking-wider', badgeColor)}>Vai trò chính</span>
      <h2 className="text-xl font-black text-slate-900">{roleTitle}</h2>
    </div>
    <p className="mt-2 text-xs leading-relaxed text-slate-600">{description}</p>
  </div>
);

const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: string }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className={clsx('mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md', color)}>
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-2xl font-black text-slate-950">{value ?? 0}</p>
    <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
  </div>
);

const Panel = ({ title, subtitle, icon: Icon, children, className = '' }: any) => (
  <section className={clsx('rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm', className)}>
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
    {children}
  </section>
);

const TextInput = ({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder: string; type?: string }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
  />
);

const TextArea = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={3}
    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
  />
);

const Select = ({ value, onChange, options, labels = {} }: { value: string; onChange: (v: string) => void; options: string[]; labels?: Record<string, string> }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold outline-none focus:border-indigo-400 focus:bg-white"
  >
    {options.map((option) => (
      <option key={option} value={option}>
        {labels[option] || option}
      </option>
    ))}
  </select>
);

const PrimaryButton = ({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 transition"
  >
    {children}
  </button>
);

const FilterPill = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={clsx(
      'rounded-xl px-3 py-1.5 text-[11px] font-bold transition',
      active ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    )}
  >
    {label}
  </button>
);

const UserRow = ({ user, onAction }: { user: AdminUser; onAction: (a: () => Promise<unknown>) => void }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <p className="font-black text-slate-950 text-sm">{user.name}</p>
          <span className={clsx('rounded-full px-2.5 py-0.5 text-[10px] font-black border', roleBadgeColors[user.role])}>
            {roleLabels[user.role]}
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-500">{user.email}</p>
        <p className="mt-1 text-[11px] text-slate-400">
          {user._count.tasks} task · {user._count.events} sự kiện · Hoạt động: {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString('vi-VN') : 'chưa có'}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge>{tierLabels[user.accountTier]}</Badge>
        <Badge>{statusLabels[user.status]}</Badge>
        {user.isVerified ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Đã xác minh</span> : null}
      </div>
    </div>

    <div className="mt-3 grid gap-2 md:grid-cols-5">
      <ActionSelect
        value={user.role}
        options={['USER', 'ADMIN', 'CONTENT_MANAGER', 'CUSTOMER_SUPPORT', 'ENTERPRISE_LEAD']}
        labels={roleLabels}
        onChange={(v) => onAction(() => apiClient.patch(`/admin/users/${user.id}/account`, { role: v }))}
      />
      <ActionSelect
        value={user.accountTier}
        options={['FREE', 'PREMIUM', 'VIP', 'INTERNAL']}
        labels={tierLabels}
        onChange={(v) => onAction(() => apiClient.patch(`/admin/users/${user.id}/account`, { accountTier: v }))}
      />
      <ActionSelect
        value={user.status}
        options={['ACTIVE', 'LOCKED']}
        labels={statusLabels}
        onChange={(v) => onAction(() => apiClient.patch(`/admin/users/${user.id}/account`, { status: v }))}
      />
      <button
        onClick={() => onAction(() => apiClient.patch(`/admin/users/${user.id}/account`, { isVerified: !user.isVerified }))}
        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
      >
        {user.isVerified ? 'Bỏ xác minh' : 'Xác minh'}
      </button>
      {user.role !== 'ADMIN' && (
        <button
          onClick={() => window.confirm(`Xóa ${user.email}?`) && onAction(() => apiClient.delete(`/admin/users/${user.id}`))}
          className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50"
        >
          <Trash2 className="inline h-3.5 w-3.5" /> Xóa
        </button>
      )}
    </div>
  </div>
);

const TicketCard = ({ ticket, onAction }: { ticket: Ticket; onAction: (a: () => Promise<unknown>) => void }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-black text-slate-950 text-sm">{ticket.subject}</p>
        <p className="text-xs font-semibold text-slate-500">Gửi bởi: {ticket.user.email}</p>
      </div>
      <Badge>{ticketLabels[ticket.status]}</Badge>
    </div>
    <p className="mt-2 text-xs leading-relaxed text-slate-700 bg-white p-3 rounded-xl border border-slate-200">{ticket.message}</p>
    {ticket.adminReply && (
      <p className="mt-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-900">
        💬 Phản hồi CS: {ticket.adminReply}
      </p>
    )}
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <ActionSelect
        value={ticket.status}
        options={['OPEN', 'IN_PROGRESS', 'RESOLVED']}
        labels={ticketLabels}
        onChange={(v) => onAction(() => apiClient.patch(`/admin/support/tickets/${ticket.id}`, { status: v }))}
      />
      <button
        onClick={() => {
          const reply = window.prompt('Nhập phản hồi chăm sóc khách hàng:', ticket.adminReply || '');
          if (reply !== null) onAction(() => apiClient.patch(`/admin/support/tickets/${ticket.id}`, { adminReply: reply, status: 'RESOLVED' }));
        }}
        className="rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50"
      >
        💬 Phản hồi CS
      </button>
    </div>
  </div>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full bg-slate-200/60 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">{children}</span>
);

const ActionSelect = ({ value, options, labels = {}, onChange }: { value: string; options: string[]; labels?: Record<string, string>; onChange: (v: string) => void }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400"
  >
    {options.map((o) => (
      <option key={o} value={o}>
        {labels[o] || o}
      </option>
    ))}
  </select>
);

const List = ({ rows }: { rows: { id: string; title: string; meta: string; desc?: string; onDelete?: () => void; actionLabel?: React.ReactNode }[] }) => (
  <div className="space-y-3">
    {rows.length === 0 ? (
      <p className="rounded-2xl bg-slate-50 p-5 text-xs font-semibold text-slate-500">Chưa có dữ liệu.</p>
    ) : (
      rows.map((row) => (
        <div key={row.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-black text-slate-950 text-xs">{row.title}</p>
              <p className="text-[11px] font-semibold text-slate-500">{row.meta}</p>
            </div>
            {row.onDelete && (
              <button onClick={row.onDelete} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100">
                {row.actionLabel || <Trash2 className="h-3.5 w-3.5 text-rose-600" />}
              </button>
            )}
          </div>
          {row.desc && <p className="mt-2 line-clamp-3 text-xs text-slate-600">{row.desc}</p>}
        </div>
      ))
    )}
  </div>
);
