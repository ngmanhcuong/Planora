import { TeamWorkspace } from './TeamWorkspace';
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '@/lib/axios';
import type { ApiResponse } from '@/types';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { getMultiLangText, normalizeLanguage } from '@/lib/i18n';
import {
  Bot,
  Briefcase,
  FileText,
  Headphones,
  History,
  Loader2,
  Megaphone,
  MessageSquare,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Tags,
  Trash2,
  UserCog,
  Users,
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

type AuditLog = { id: string; action: string; user: string; time: string };

type CustomerNote = { id: string; userId: string; agent: string; note: string; date: string };

const roleBadgeColors: Record<Role, string> = {
  ADMIN: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 shadow-sm',
  CONTENT_MANAGER: 'bg-amber-50 text-amber-700 border-amber-200/80 shadow-sm',
  CUSTOMER_SUPPORT: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-sm',
  ENTERPRISE_LEAD: 'bg-purple-50 text-purple-700 border-purple-200/80 shadow-sm',
  USER: 'bg-slate-100 text-slate-700 border-slate-200',
};

const emptyUserForm = { name: '', email: '', password: '', role: 'USER' as Role, accountTier: 'FREE' as Tier, status: 'ACTIVE' as Status };
const emptyTicketForm = { userId: '', subject: '', message: '' };
const emptyConfigForm = { key: 'ai.schedule.maxSessions', label: '', value: '5', description: '' };
const emptyTemplateForm = { name: '', type: 'TASK' as CategoryType, color: '#4F46E5', bgColor: '#E2DFFF', textColor: '#3323CC', description: '', isActive: true };
const emptyCampaignForm = { title: '', message: '', audience: '' as '' | Tier, sendNow: true };
const emptyContentForm = { type: 'HANDBOOK' as ContentType, title: '', body: '', isPublished: false };

export const AdminDashboardPage: React.FC = () => {
  const { data: settings } = useSettings();
  const language = normalizeLanguage(settings?.language);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as string) || 'users';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

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

  // CS Lookup User & Notes
  const [selectedCsUser, setSelectedCsUser] = useState<AdminUser | null>(null);
  const [csNotes, setCsNotes] = useState<CustomerNote[]>([]);
  const [newCsNoteText, setNewCsNoteText] = useState('');


  // Multi-lang role labels
  const getRoleLabel = (r: Role) => {
    switch (r) {
      case 'ADMIN':
        return getMultiLangText(language, { vi: 'Quản trị hệ thống', en: 'System admin', ja: 'システム管理', ko: '시스템 관리', zh: '系统管理', fr: 'Admin système', de: 'Systemverwaltung', es: 'Admin. del sistema' });
      case 'CONTENT_MANAGER':
        return getMultiLangText(language, { vi: 'Quản lý nội dung / Kiểm duyệt', en: 'Content manager / Moderator', ja: 'コンテンツ管理者 / モデレーター', ko: '콘텐츠 관리자 / 중재자', zh: '内容管理员 / 审核员', fr: 'Gestionnaire de contenu / Modérateur', de: 'Inhaltsmanager / Moderator', es: 'Gestor de contenido / Moderador' });
      case 'CUSTOMER_SUPPORT':
        return getMultiLangText(language, { vi: 'Chăm sóc khách hàng (CS)', en: 'Customer support (CS)', ja: 'カスタマーサポート (CS)', ko: '고객 지원 (CS)', zh: '客户支持 (CS)', fr: 'Support client (CS)', de: 'Kundensupport (CS)', es: 'Atención al cliente (CS)' });
      case 'ENTERPRISE_LEAD':
        return getMultiLangText(language, { vi: 'Doanh nghiệp / Team Lead', en: 'Enterprise / Team Lead', ja: '法人 / チームリード', ko: '기업 / 팀 리드', zh: '企业 / 团队 Leader', fr: 'Enterprise / Lead d\'Équipe', de: 'Enterprise / Team-Lead', es: 'Empresa / Team Lead' });
      default:
        return getMultiLangText(language, { vi: 'Người dùng cá nhân', en: 'Personal user', ja: '一般ユーザー', ko: '일반 사용자', zh: '普通用户', fr: 'Utilisateur personnel', de: 'Persönlicher Benutzer', es: 'Usuario personal' });
    }
  };

  const roleLabelsMap: Record<Role, string> = {
    ADMIN: getRoleLabel('ADMIN'),
    CONTENT_MANAGER: getRoleLabel('CONTENT_MANAGER'),
    CUSTOMER_SUPPORT: getRoleLabel('CUSTOMER_SUPPORT'),
    ENTERPRISE_LEAD: getRoleLabel('ENTERPRISE_LEAD'),
    USER: getRoleLabel('USER'),
  };

  const getTierLabel = (t: Tier) => {
    switch (t) {
      case 'FREE': return getMultiLangText(language, { vi: 'Miễn phí', en: 'Free', ja: '無料', ko: '무료', zh: '免费', fr: 'Gratuit', de: 'Kostenlos', es: 'Gratuito' });
      case 'PREMIUM': return getMultiLangText(language, { vi: 'Cao cấp (Premium)', en: 'Premium', ja: 'プレミアム', ko: '프리미엄', zh: '高级 (Premium)', fr: 'Premium', de: 'Premium', es: 'Premium' });
      case 'VIP': return getMultiLangText(language, { vi: 'VIP', en: 'VIP', ja: 'VIP', ko: 'VIP', zh: 'VIP', fr: 'VIP', de: 'VIP', es: 'VIP' });
      case 'INTERNAL': return getMultiLangText(language, { vi: 'Nội bộ', en: 'Internal', ja: '社内', ko: '내부', zh: '内部', fr: 'Interne', de: 'Intern', es: 'Interno' });
    }
  };

  const tierLabelsMap: Record<Tier, string> = {
    FREE: getTierLabel('FREE'),
    PREMIUM: getTierLabel('PREMIUM'),
    VIP: getTierLabel('VIP'),
    INTERNAL: getTierLabel('INTERNAL'),
  };

  const getStatusLabel = (s: Status) => {
    return s === 'ACTIVE'
      ? getMultiLangText(language, { vi: 'Đang hoạt động', en: 'Active', ja: '有効', ko: '활성', zh: '活跃', fr: 'Actif', de: 'Aktiv', es: 'Activo' })
      : getMultiLangText(language, { vi: 'Đã khóa', en: 'Locked', ja: 'ロック中', ko: '잠김', zh: '已锁定', fr: 'Verrouillé', de: 'Gesperrt', es: 'Bloqueado' });
  };

  const statusLabelsMap: Record<Status, string> = {
    ACTIVE: getStatusLabel('ACTIVE'),
    LOCKED: getStatusLabel('LOCKED'),
  };

  const ticketLabelsMap: Record<TicketStatus, string> = {
    OPEN: getMultiLangText(language, { vi: 'Mới', en: 'Open', ja: '新規', ko: '신규', zh: '新工单', fr: 'Ouvert', de: 'Offen', es: 'Abierto' }),
    IN_PROGRESS: getMultiLangText(language, { vi: 'Đang xử lý', en: 'In progress', ja: '対応中', ko: '처리 중', zh: '处理中', fr: 'En cours', de: 'In Bearbeitung', es: 'En proceso' }),
    RESOLVED: getMultiLangText(language, { vi: 'Đã giải quyết', en: 'Resolved', ja: '解決済み', ko: '해결됨', zh: '已解决', fr: 'Résolu', de: 'Gelöst', es: 'Resuelto' }),
  };


  const adminTabs = useMemo(() => [
    { id: 'users', icon: ShieldCheck, label: getMultiLangText(language, { vi: 'Quản trị', en: 'Admin', ja: '管理', ko: '관리', zh: '管理', fr: 'Admin', de: 'Admin', es: 'Admin' }), desc: getMultiLangText(language, { vi: 'Tài khoản & quyền', en: 'Accounts & roles', ja: 'アカウントと権限', ko: '계정 및 권한', zh: '账户与权限', fr: 'Comptes & rôles', de: 'Konten & Rollen', es: 'Cuentas y roles' }) },
    { id: 'content', icon: FileText, label: getMultiLangText(language, { vi: 'Nội dung', en: 'Content', ja: 'コンテンツ', ko: '콘텐츠', zh: '内容', fr: 'Contenu', de: 'Inhalte', es: 'Contenido' }), desc: getMultiLangText(language, { vi: 'Bài viết & mẫu', en: 'Posts & templates', ja: '記事とテンプレート', ko: '게시글 및 템플릿', zh: '文章与模板', fr: 'Articles & modèles', de: 'Beiträge & Vorlagen', es: 'Artículos y plantillas' }) },
    { id: 'support', icon: Headphones, label: getMultiLangText(language, { vi: 'Hỗ trợ', en: 'Support', ja: 'サポート', ko: '지원', zh: '支持', fr: 'Support', de: 'Support', es: 'Soporte' }), desc: getMultiLangText(language, { vi: 'Ticket & CS', en: 'Tickets & CS', ja: 'チケットとCS', ko: '티켓 및 CS', zh: '工单与客服', fr: 'Tickets & CS', de: 'Tickets & CS', es: 'Tickets y CS' }) },
    { id: 'team', icon: Users, label: getMultiLangText(language, { vi: 'Doanh nghiệp', en: 'Enterprise', ja: '法人', ko: '기업', zh: '企业', fr: 'Entreprise', de: 'Enterprise', es: 'Empresa' }), desc: getMultiLangText(language, { vi: 'Đội nhóm & KPI', en: 'Teams & KPI', ja: 'チームとKPI', ko: '팀 및 KPI', zh: '团队与 KPI', fr: 'Équipes & KPI', de: 'Teams & KPI', es: 'Equipos y KPI' }) },
    { id: 'system', icon: Bot, label: getMultiLangText(language, { vi: 'Tự động hóa', en: 'Automation', ja: '自動化', ko: '자동화', zh: '自动化', fr: 'Automatisation', de: 'Automatisierung', es: 'Automatización' }), desc: getMultiLangText(language, { vi: 'AI & cấu hình', en: 'AI & config', ja: 'AIと設定', ko: 'AI 및 설정', zh: 'AI 与配置', fr: 'IA & config', de: 'KI & Konfig.', es: 'IA y config.' }) },
  ], [language]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const contentTypeLabelsMap: Record<ContentType, string> = {
    HANDBOOK: getMultiLangText(language, { vi: 'Handbook / Cẩm nang', en: 'Handbook / Guide', ja: 'ハンドブック / ガイド', ko: '핸드북 / 가이드', zh: '手册 / 指南', fr: 'Manuel / Guide', de: 'Handbuch / Leitfaden', es: 'Manual / Guía' }),
    HOMEPAGE: getMultiLangText(language, { vi: 'Trang chủ', en: 'Homepage', ja: 'ホームページ', ko: '홈페이지', zh: '主页', fr: 'Page d\'accueil', de: 'Startseite', es: 'Página de inicio' }),
    BANNER: getMultiLangText(language, { vi: 'Banner quảng bá', en: 'Promotional banner', ja: '宣伝バナー', ko: '홍보 배너', zh: '宣传横幅', fr: 'Bannière promotionnelle', de: 'Werbebanner', es: 'Banner promocional' }),
  };

  const categoryTypeLabelsMap: Record<CategoryType, string> = {
    STUDY: getMultiLangText(language, { vi: 'Học tập (STUDY)', en: 'Study (STUDY)', ja: '学習 (STUDY)', ko: '학습 (STUDY)', zh: '学习 (STUDY)', fr: 'Études (STUDY)', de: 'Studium (STUDY)', es: 'Estudio (STUDY)' }),
    WORK: getMultiLangText(language, { vi: 'Công việc (WORK)', en: 'Work (WORK)', ja: '仕事 (WORK)', ko: '업무 (WORK)', zh: '工作 (WORK)', fr: 'Travail (WORK)', de: 'Arbeit (WORK)', es: 'Trabajo (WORK)' }),
    TASK: getMultiLangText(language, { vi: 'Nhiệm vụ (TASK)', en: 'Task (TASK)', ja: 'タスク (TASK)', ko: '작업 (TASK)', zh: '任务 (TASK)', fr: 'Tâche (TASK)', de: 'Aufgabe (TASK)', es: 'Tarea (TASK)' }),
    MEETING: getMultiLangText(language, { vi: 'Cuộc họp (MEETING)', en: 'Meeting (MEETING)', ja: '会議 (MEETING)', ko: '회의 (MEETING)', zh: '会议 (MEETING)', fr: 'Réunion (MEETING)', de: 'Besprechung (MEETING)', es: 'Reunión (MEETING)' }),
    PERSONAL: getMultiLangText(language, { vi: 'Cá nhân (PERSONAL)', en: 'Personal (PERSONAL)', ja: '個人 (PERSONAL)', ko: '개인 (PERSONAL)', zh: '个人 (PERSONAL)', fr: 'Personnel (PERSONAL)', de: 'Persönlich (PERSONAL)', es: 'Personal (PERSONAL)' }),
    HABIT: getMultiLangText(language, { vi: 'Thói quen (HABIT)', en: 'Habit (HABIT)', ja: '習慣 (HABIT)', ko: '습관 (HABIT)', zh: '习惯 (HABIT)', fr: 'Habitude (HABIT)', de: 'Gewohnheit (HABIT)', es: 'Hábito (HABIT)' }),
    DEADLINE: getMultiLangText(language, { vi: 'Hạn chót (DEADLINE)', en: 'Deadline (DEADLINE)', ja: '締切 (DEADLINE)', ko: '마감일 (DEADLINE)', zh: '截止日期 (DEADLINE)', fr: 'Échéance (DEADLINE)', de: 'Frist (DEADLINE)', es: 'Plazo (DEADLINE)' }),
  };


  const getSystemConfigText = (key: string, fallbackLabel?: string | null, fallbackDescription?: string | null) => {
    const knownConfigs: Record<string, { label: string; description: string }> = {
      'ai.schedule.maxSessions': {
        label: getMultiLangText(language, { vi: 'Số phiên gợi ý tối đa', en: 'Maximum suggested sessions', ja: '最大提案セッション数', ko: '최대 추천 세션 수', zh: '最大建议会话数', fr: 'Nombre maximal de sessions suggérées', de: 'Maximale vorgeschlagene Sitzungen', es: 'Sesiones sugeridas máximas' }),
        description: getMultiLangText(language, { vi: 'Thông số thật dùng để điều chỉnh thuật toán gợi ý lịch.', en: 'Real configuration used to tune the smart scheduling algorithm.', ja: 'スマートスケジュール提案アルゴリズムを調整する実設定です。', ko: '스마트 일정 추천 알고리즘을 조정하는 실제 설정입니다.', zh: '用于调整智能日程推荐算法的真实配置。', fr: 'Paramètre réel utilisé pour ajuster l’algorithme de planification intelligente.', de: 'Echte Einstellung zur Feinabstimmung des intelligenten Planungsalgorithmus.', es: 'Configuración real usada para ajustar el algoritmo de planificación inteligente.' }),
      },
    };
    return knownConfigs[key] || {
      label: fallbackLabel?.trim() || key,
      description: fallbackDescription?.trim() || '',
    };
  };

  const getFeatureUsageLabel = (key: string) => {
    const labels: Record<string, string> = {
      tasks: getMultiLangText(language, { vi: 'Công việc', en: 'Tasks', ja: 'タスク', ko: '작업', zh: '任务', fr: 'Tâches', de: 'Aufgaben', es: 'Tareas' }),
      events: getMultiLangText(language, { vi: 'Sự kiện', en: 'Events', ja: 'イベント', ko: '이벤트', zh: '事件', fr: 'Événements', de: 'Termine', es: 'Eventos' }),
      timetables: getMultiLangText(language, { vi: 'Thời khóa biểu', en: 'Timetables', ja: '時間割', ko: '시간표', zh: '课表', fr: 'Emplois du temps', de: 'Stundenpläne', es: 'Horarios' }),
      habits: getMultiLangText(language, { vi: 'Thói quen', en: 'Habits', ja: '習慣', ko: '습관', zh: '习惯', fr: 'Habitudes', de: 'Gewohnheiten', es: 'Hábitos' }),
      notes: getMultiLangText(language, { vi: 'Ghi chú', en: 'Notes', ja: 'メモ', ko: '노트', zh: '笔记', fr: 'Notes', de: 'Notizen', es: 'Notas' }),
      notifications: getMultiLangText(language, { vi: 'Thông báo', en: 'Notifications', ja: '通知', ko: '알림', zh: '通知', fr: 'Notifications', de: 'Benachrichtigungen', es: 'Notificaciones' }),
    };
    return labels[key] || key;
  };

  const buildConfigPayload = () => {
    const preset = getSystemConfigText(configForm.key, configForm.label, configForm.description);
    return {
      ...configForm,
      label: configForm.label.trim() || preset.label,
      description: configForm.description.trim() || preset.description,
    };
  };
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as string;
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

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
      setError(err?.response?.data?.message || getMultiLangText(language, { vi: 'Không tải được dữ liệu quản trị.', en: 'Failed to load admin data.', ja: '管理者データを読み込めませんでした。', ko: '관리자 데이터를 불러올 수 없습니다.', zh: '无法加载管理员数据。', fr: 'Échec du chargement des données d\'administration.', de: 'Admin-Daten konnten nicht geladen werden.', es: 'No se pudieron cargar los datos de administración.' }));
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
      setError(err?.response?.data?.message || getMultiLangText(language, { vi: 'Thao tác thất bại.', en: 'Operation failed.', ja: '操作に失敗しました。', ko: '작업에 실패했습니다.', zh: '操作失败。', fr: 'L\'opération a échoué.', de: 'Vorgang fehlgeschlagen.', es: 'Operación fallida.' }));
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

  const handleAddCsNote = () => {
    if (!newCsNoteText.trim() || !selectedCsUser) return;
    const noteObj: CustomerNote = {
      id: `cn_${Date.now()}`,
      userId: selectedCsUser.id,
      agent: 'CS Support Agent',
      note: newCsNoteText.trim(),
      date: new Date().toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US'),
    };
    setCsNotes([noteObj, ...csNotes]);
    setNewCsNoteText('');
  };

  if (isLoading || !data) return (
    <div className="flex min-h-[60vh] items-center justify-center text-slate-500 font-medium">
      <Loader2 className="mr-3 h-6 w-6 animate-spin text-indigo-600" />
      {getMultiLangText(language, { vi: 'Đang tải khu quản trị Planora...', en: 'Loading Planora Admin dashboard...', ja: 'Planora 管理ダッシュボードを読み込み中...', ko: 'Planora 관리자 대시보드 로딩 중...', zh: '正在加载 Planora 管理仪表板...', fr: 'Chargement du tableau de bord Planora...', de: 'Planora Admin-Dashboard wird geladen...', es: 'Cargando panel de administración de Planora...' })}
    </div>
  );

  const auditLogs: AuditLog[] = [
    ...data.overview.recentUsers.slice(0, 3).map((user) => ({
      id: `user_${user.id}`,
      action: getMultiLangText(language, { vi: 'Tài khoản được ghi nhận trong hệ thống', en: 'Account recorded in the system', ja: 'アカウントがシステムに記録されました', ko: '계정이 시스템에 기록됨', zh: '账户已记录到系统', fr: 'Compte enregistré dans le système', de: 'Konto im System erfasst', es: 'Cuenta registrada en el sistema' }),
      user: user.email,
      time: new Date(user.createdAt).toLocaleString(language === 'vi' ? 'vi-VN' : undefined),
    })),
    ...data.overview.recentTickets.slice(0, 3).map((ticket) => ({
      id: `ticket_${ticket.id}`,
      action: ticket.subject,
      user: ticket.user.email,
      time: new Date(ticket.createdAt).toLocaleString(language === 'vi' ? 'vi-VN' : undefined),
    })),
  ];

  const canCreateUser = Boolean(userForm.name.trim() && userForm.email.trim() && userForm.password.trim());

  return (
    <div className="mx-auto max-w-[1480px] space-y-6 px-3 pb-12 lg:px-6">
      {/* Dynamic Role Header Banner */}
      {activeTab === 'users' && (
        <RoleHeroBanner
          title={getMultiLangText(language, { vi: 'Quản trị viên hệ thống', en: 'System Administration Hub', ja: 'システム管理ハブ', ko: '시스템 관리 허브', zh: '系统管理中心', fr: 'Centre d\'administration système', de: 'System-Verwaltungszentrum', es: 'Centro de administración del sistema' })}
          icon={ShieldCheck}
          subtitle={getMultiLangText(language, { vi: 'Toàn quyền điều hành hệ thống, quản lý tài khoản, giám sát máy chủ real-time, phân quyền 4 vai trò và tinh chỉnh tham số AI.', en: 'Full system control, account management, real-time server health monitoring, 4-role permissions, and AI tuning.', ja: 'システム制御、アカウント管理、リアルタイムサーバー監視、4つの役割権限設定、AIパラメータの微調整。', ko: '전체 시스템 제어, 계정 관리, 실시간 서버 상태 모니터링, 4가지 역할 권한 및 AI 파라미터 조정.', zh: '全权掌控系统、管理账户、实时监控服务器健康、设置 4 种角色权限及微调 AI 参数。', fr: 'Contrôle total du système, gestion des comptes, surveillance du serveur en temps réel et réglages IA.', de: 'Vollständige Systemkontrolle, Kontoverwaltung, Echtzeit-Serverüberwachung und KI-Feineinstellung.', es: 'Control total del sistema, gestión de cuentas, monitoreo de servidor en tiempo real y ajustes de IA.' })}
          gradient="from-slate-950 via-indigo-950 to-slate-900"
          accentColor="text-indigo-400"
          badgeText={getMultiLangText(language, { vi: 'Tối cao / Full Access', en: 'Super Admin Access', ja: '特権管理者アクセス', ko: '최고 관리자 권한', zh: '超级管理员权限', fr: 'Accès Super Admin', de: 'Super-Admin-Zugriff', es: 'Acceso Super Admin' })}
        />
      )}

      {activeTab === 'content' && (
        <RoleHeroBanner
          title={getMultiLangText(language, { vi: 'Quản lý nội dung & kiểm duyệt', en: 'Content Studio & Moderation Center', ja: 'コンテンツスタジオ & モデレーションセンター', ko: '콘텐츠 스튜디오 & 중재 센터', zh: '内容工作室与审核中心', fr: 'Studio de contenu & centre de modération', de: 'Content-Studio & Moderationszentrum', es: 'Estudio de contenido y centro de moderación' })}
          icon={FileText}
          subtitle={getMultiLangText(language, { vi: 'Đăng bài cẩm nang hướng dẫn mẹo quản lý thời gian, thông báo ứng dụng, kiểm duyệt template công khai do người dùng đóng góp.', en: 'Publish time management guides, app announcements, and review user-contributed planning templates.', ja: '時間管理ガイド記事やアプリ告知の投稿、ユーザーが提出した公開テンプレートのモデレーション。', ko: '시간 관리 가이드 게시글, 앱 공지 발행 및 사용자가 제출한 템플릿 검수.', zh: '发布时间管理指南、应用公告，并审核用户贡献的公开计划模板。', fr: 'Publier des guides de gestion du temps et modérer les modèles publics.', de: 'Zeitmanagement-Leitfäden veröffentlichen und öffentliche Vorlagen prüfen.', es: 'Publicar guías de gestión del tiempo y moderar plantillas públicas.' })}
          gradient="from-amber-950 via-amber-900 to-slate-950"
          accentColor="text-amber-400"
          badgeText={getMultiLangText(language, { vi: 'Kiểm duyệt & Bài viết', en: 'Moderation & Editorial', ja: 'モデレーション & 編集', ko: '중재 & 편집', zh: '审核与编辑', fr: 'Modération & Éditorial', de: 'Moderation & Redaktion', es: 'Moderación y Editorial' })}
        />
      )}

      {activeTab === 'support' && (
        <RoleHeroBanner
          title={getMultiLangText(language, { vi: 'Chăm sóc khách hàng & CS Support Hub', en: 'Customer Support Desk & CS Hub', ja: 'カスタマーサポートデスク & CS ハブ', ko: '고객 지원 데스크 & CS 허브', zh: '客户支持台与 CS 中心', fr: 'Bureau de support client & CS Hub', de: 'Kundensupport-Desk & CS-Hub', es: 'Mesa de atención al cliente y CS Hub' })}
          icon={Headphones}
          subtitle={getMultiLangText(language, { vi: 'Xử lý ticket hỗ trợ, tra cứu thông tin tài khoản 360°, ghi chú chăm sóc khách hàng và kiểm tra trạng thái hoạt động.', en: 'Resolve tickets, inspect customer 360 profiles, add support notes, and guide troubleshooting.', ja: 'サポートチケットの対応、顧客 360° プロフィールの確認、サポートメモの追加、トラブルシューティング案内。', ko: '지원 티켓 해결, 고객 360° 프로필 조회, 지원 메모 작성 및 문제 해결 안내.', zh: '解决支持工单、查阅 360° 客户档案、添加客服笔记并指导故障排查。', fr: 'Résoudre les tickets, inspecter les profils 360° et ajouter des notes de support.', de: 'Tickets lösen, 360°-Kundenprofile prüfen und Support-Notizen hinzufügen.', es: 'Resolver tickets, inspeccionar perfiles 360° y agregar notas de soporte.' })}
          gradient="from-teal-950 via-emerald-950 to-slate-950"
          accentColor="text-emerald-400"
          badgeText={getMultiLangText(language, { vi: 'Hỗ trợ khách hàng VIP', en: 'VIP & Customer Care', ja: 'VIP & 顧客ケア', ko: 'VIP & 고객 케어', zh: 'VIP 与客户关怀', fr: 'Service Client VIP', de: 'VIP & Kundenbetreuung', es: 'Atención al Cliente VIP' })}
        />
      )}

      {activeTab === 'team' && (
        <RoleHeroBanner
          title={getMultiLangText(language, { vi: 'Người dùng cao cấp / Doanh nghiệp', en: 'Enterprise & Team Lead Suite', ja: '法人 & チームリードスイート', ko: '기업 & 팀 리드 스위트', zh: '企业与团队 Leader 套件', fr: 'Suite Enterprise & Lead d\'Équipe', de: 'Enterprise & Team-Lead-Suite', es: 'Suite Empresa y Team Lead' })}
          icon={Briefcase}
          subtitle={getMultiLangText(language, { vi: 'Phân công công việc theo khối lượng đang mở, quản lý hạn hoàn thành và theo dõi tiến độ từng thành viên.', en: 'Assign tasks by open workload, manage due dates, and track each member’s progress.', ja: 'チームワークスペースの管理、AI タスク自動割当、部門進捗の監視、詳細アナリティクスの解放。', ko: '팀 워크스페이스 관리, AI 작업 자동 할당, 부서 진행 상황 모니터링 및 심층 분석 잠금 해제.', zh: '管理团队工作区、AI 自动分配任务、监控部门进度并解锁深度分析。', fr: 'Gérer les espaces de travail d\'équipe, attribuer des tâches automatiquement via IA et suivre les progrès.', de: 'Team-Arbeitsbereiche verwalten, Aufgaben automatisch zuweisen und Fortschritt überwachen.', es: 'Gestionar espacios de trabajo de equipo, asignar tareas automáticamente con IA y supervisar el progreso.' })}
          gradient="from-purple-950 via-fuchsia-950 to-slate-950"
          accentColor="text-purple-400"
          badgeText={getMultiLangText(language, { vi: 'Doanh nghiệp & Đội nhóm', en: 'Enterprise & Workspace', ja: '法人 & ワークスペース', ko: '기업 & 워크스페이스', zh: '企业与工作区', fr: 'Enterprise & Espace de travail', de: 'Enterprise & Arbeitsbereich', es: 'Empresa y Espacio de trabajo' })}
        />
      )}

      {activeTab === 'system' && (
        <RoleHeroBanner
          title={getMultiLangText(language, { vi: 'Tự động hóa AI & cấu hình hệ thống', en: 'AI Automation & System Configuration', ja: 'AI自動化とシステム設定', ko: 'AI 자동화 및 시스템 설정', zh: 'AI 自动化与系统配置', fr: 'Automatisation IA & configuration système', de: 'KI-Automatisierung & Systemkonfiguration', es: 'Automatización IA y configuración del sistema' })}
          icon={Bot}
          subtitle={getMultiLangText(language, { vi: 'Tinh chỉnh tham số gợi ý lịch trình, quản lý cấu hình vận hành và theo dõi mức sử dụng tính năng từ dữ liệu thật.', en: 'Tune scheduling parameters, manage operational settings, and monitor feature usage from real system data.', ja: 'スケジュール提案パラメータ、運用設定、実データによる機能利用状況を管理します。', ko: '일정 추천 매개변수와 운영 설정을 조정하고 실제 데이터 기반 기능 사용량을 모니터링합니다.', zh: '调整日程推荐参数，管理运行配置，并基于真实数据监控功能使用情况。', fr: 'Ajuster les paramètres de planification, gérer la configuration et suivre l’usage réel des fonctionnalités.', de: 'Planungsparameter anpassen, Betriebseinstellungen verwalten und echte Funktionsnutzung überwachen.', es: 'Ajustar parámetros de planificación, administrar configuración y monitorear uso real de funciones.' })}
          gradient="from-indigo-950 via-blue-950 to-slate-950"
          accentColor="text-cyan-300"
          badgeText={getMultiLangText(language, { vi: 'AI & vận hành', en: 'AI & Operations', ja: 'AI & 運用', ko: 'AI 및 운영', zh: 'AI 与运维', fr: 'IA & opérations', de: 'KI & Betrieb', es: 'IA y operaciones' })}
        />
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur">
        <div className="grid gap-2 md:grid-cols-5">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={clsx(
                  'group flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all',
                  active ? 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-transparent bg-slate-50/80 text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-900'
                )}
              >
                <span className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition', active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white text-slate-500 group-hover:text-indigo-600')}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{tab.label}</span>
                  <span className="block truncate text-[11px] font-semibold opacity-75">{tab.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* TAB 1: Quản trị hệ thống (System Admin) */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(360px,0.85fr)_minmax(640px,1.65fr)]">
            <Panel
              title={getMultiLangText(language, { vi: 'Tạo tài khoản & Phân quyền', en: 'Create account & assign role', ja: 'アカウント作成 & 権限割り当て', ko: '계정 생성 & 역할 할당', zh: '创建账户与分配角色', fr: 'Créer un compte & attribuer un rôle', de: 'Konto erstellen & Rolle zuweisen', es: 'Crear cuenta y asignar rol' })}
              icon={Plus}
              subtitle={getMultiLangText(language, { vi: 'Khởi tạo tài khoản và gán 1 trong 4 vai trò quản trị.', en: 'Create an account and assign one admin role.', ja: 'アカウントを作成し、管理者の役割を割当。', ko: '계정을 생성하고 관리자 역할을 할당합니다.', zh: '创建账户并分配管理角色。', fr: 'Créer un compte et attribuer un rôle.', de: 'Konto erstellen und Rolle zuweisen.', es: 'Crear cuenta y asignar un rol.' })}
            >
              <div className="grid gap-4">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs font-medium text-indigo-900">{getMultiLangText(language, { vi: 'Tài khoản tạo ở đây sẽ dùng dữ liệu thật và đăng nhập được ngay theo quyền được gán.', en: 'Accounts created here are real and can sign in immediately with the assigned role.', ja: 'ここで作成したアカウントは実データで、割り当てた権限ですぐログインできます。', ko: '여기서 만든 계정은 실제 계정이며 지정된 권한으로 바로 로그인할 수 있습니다.', zh: '此处创建的账户为真实账户，并可按分配权限立即登录。', fr: 'Les comptes créés ici sont réels et peuvent se connecter avec le rôle attribué.', de: 'Hier erstellte Konten sind echte Konten und können sich sofort anmelden.', es: 'Las cuentas creadas aquí son reales y pueden iniciar sesión con el rol asignado.' })}</div>
                <TextInput placeholder={getMultiLangText(language, { vi: 'Tên người dùng', en: 'User name', ja: 'ユーザー名', ko: '사용자 이름', zh: '用户名', fr: 'Nom d\'utilisateur', de: 'Benutzername', es: 'Nombre de usuario' })} value={userForm.name} onChange={(v) => setUserForm({ ...userForm, name: v })} />
                <TextInput placeholder="Email" value={userForm.email} onChange={(v) => setUserForm({ ...userForm, email: v })} />
                <TextInput placeholder={getMultiLangText(language, { vi: 'Mật khẩu', en: 'Password', ja: 'パスワード', ko: '비밀번호', zh: '密码', fr: 'Mot de passe', de: 'Passwort', es: 'Contraseña' })} type="password" value={userForm.password} onChange={(v) => setUserForm({ ...userForm, password: v })} />

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    {getMultiLangText(language, { vi: 'Chọn vai trò hệ thống:', en: 'Select system role:', ja: 'システム役割を選択:', ko: '시스템 역할 선택:', zh: '选择系统角色:', fr: 'Sélectionner le rôle système :', de: 'Systemrolle auswählen:', es: 'Seleccionar rol del sistema:' })}
                  </label>
                  <Select
                    value={userForm.role}
                    onChange={(v) => setUserForm({ ...userForm, role: v as Role })}
                    options={['USER', 'ADMIN', 'CONTENT_MANAGER', 'CUSTOMER_SUPPORT', 'ENTERPRISE_LEAD']}
                    labels={roleLabelsMap}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      {getMultiLangText(language, { vi: 'Gói tài khoản:', en: 'Account tier:', ja: 'アカウントプラン:', ko: '계정 플랜:', zh: '账户套餐:', fr: 'Forfait de compte :', de: 'Kontoplan:', es: 'Plan de cuenta:' })}
                    </label>
                    <Select value={userForm.accountTier} onChange={(v) => setUserForm({ ...userForm, accountTier: v as Tier })} options={['FREE', 'PREMIUM', 'VIP', 'INTERNAL']} labels={tierLabelsMap} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      {getMultiLangText(language, { vi: 'Trạng thái:', en: 'Status:', ja: 'ステータス:', ko: '상태:', zh: '状态:', fr: 'Statut :', de: 'Status:', es: 'Estado:' })}
                    </label>
                    <Select value={userForm.status} onChange={(v) => setUserForm({ ...userForm, status: v as Status })} options={['ACTIVE', 'LOCKED']} labels={statusLabelsMap} />
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <PrimaryButton disabled={isSaving || !canCreateUser} onClick={() => runAction(() => apiClient.post('/admin/users', userForm), () => setUserForm(emptyUserForm))}>
                    {getMultiLangText(language, { vi: '+ Tạo & Gán vai trò', en: '+ Create & assign role', ja: '+ アカウント作成 & 割当', ko: '+ 생성 및 역할 할당', zh: '+ 创建并分配角色', fr: '+ Créer & attribuer le rôle', de: '+ Erstellen & Rolle zuweisen', es: '+ Crear y asignar rol' })}
                  </PrimaryButton>
                  <button type="button" onClick={() => setUserForm(emptyUserForm)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                    {getMultiLangText(language, { vi: 'Xóa form', en: 'Clear form', ja: 'フォームをクリア', ko: '폼 지우기', zh: '清空表单', fr: 'Effacer', de: 'Formular leeren', es: 'Limpiar formulario' })}
                  </button>
                </div>
              </div>
            </Panel>

            <Panel
              title={getMultiLangText(language, { vi: 'Quản lý & Phân loại người dùng', en: 'Manage & filter users', ja: 'ユーザー管理 & フィルター', ko: '사용자 관리 & 필터', zh: '管理与筛选用户', fr: 'Gérer & filtrer les utilisateurs', de: 'Benutzer verwalten & filtern', es: 'Gestionar y filtrar usuarios' })}
              icon={Users}
              subtitle={getMultiLangText(language, { vi: 'Tìm kiếm, phân quyền 4 vai trò, kiểm tra trạng thái xác minh & kích hoạt.', en: 'Search, assign 4 roles, check verification and active status.', ja: '検索、4つの役割割り当て、認証状態の確認。', ko: '검색, 4가지 역할 할당, 인증 및 활성 상태 확인.', zh: '搜索、分配 4 种角色、检查验证与激活状态。', fr: 'Rechercher, attribuer 4 rôles, vérifier le statut.', de: 'Suchen, 4 Rollen zuweisen, Status prüfen.', es: 'Buscar, asignar 4 roles y verificar estado.' })}
            >
              {/* Filter by role */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500">
                  {getMultiLangText(language, { vi: 'Lọc theo vai trò:', en: 'Filter by role:', ja: '役割でフィルター:', ko: '역할별 필터:', zh: '按角色筛选:', fr: 'Filtrer par rôle :', de: 'Nach Rolle filtern:', es: 'Filtrar por rol:' })}
                </span>
                <FilterPill label={getMultiLangText(language, { vi: 'Tất cả', en: 'All', ja: 'すべて', ko: '전체', zh: '全部', fr: 'Tous', de: 'Alle', es: 'Todos' })} active={roleFilter === 'ALL'} onClick={() => setRoleFilter('ALL')} />
                <FilterPill label={getMultiLangText(language, { vi: 'Quản trị viên (Admin)', en: 'Admin', ja: '管理者', ko: '관리자', zh: '管理员', fr: 'Admin', de: 'Admin', es: 'Admin' })} active={roleFilter === 'ADMIN'} onClick={() => setRoleFilter('ADMIN')} />
                <FilterPill label={getMultiLangText(language, { vi: 'Kiểm duyệt viên', en: 'Moderator', ja: 'モデレーター', ko: '중재자', zh: '审核员', fr: 'Modérateur', de: 'Moderator', es: 'Moderador' })} active={roleFilter === 'CONTENT_MANAGER'} onClick={() => setRoleFilter('CONTENT_MANAGER')} />
                <FilterPill label={getMultiLangText(language, { vi: 'Chăm sóc CS', en: 'Support CS', ja: 'サポート CS', ko: '지원 CS', zh: '客服 CS', fr: 'Support CS', de: 'Support CS', es: 'Soporte CS' })} active={roleFilter === 'CUSTOMER_SUPPORT'} onClick={() => setRoleFilter('CUSTOMER_SUPPORT')} />
                <FilterPill label={getMultiLangText(language, { vi: 'Enterprise / Team Lead', en: 'Enterprise / Team Lead', ja: '法人 / チームリード', ko: '기업 / 팀 리드', zh: '企业 / 团队 Leader', fr: 'Enterprise / Lead', de: 'Enterprise / Lead', es: 'Empresa / Lead' })} active={roleFilter === 'ENTERPRISE_LEAD'} onClick={() => setRoleFilter('ENTERPRISE_LEAD')} />
                <FilterPill label={getMultiLangText(language, { vi: 'Người dùng', en: 'User', ja: 'ユーザー', ko: '사용자', zh: '用户', fr: 'Utilisateur', de: 'Benutzer', es: 'Usuario' })} active={roleFilter === 'USER'} onClick={() => setRoleFilter('USER')} />
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={getMultiLangText(language, { vi: 'Tìm theo tên hoặc email...', en: 'Search by name or email...', ja: '名前またはメールで検索...', ko: '이름 또는 이메일로 검색...', zh: '按姓名或邮箱搜索...', fr: 'Rechercher par nom ou e-mail...', de: 'Nach Name oder E-Mail suchen...', es: 'Buscar por nombre o correo...' })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div className="space-y-3">
                {users.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                    {getMultiLangText(language, { vi: 'Không tìm thấy tài khoản phù hợp.', en: 'No matching accounts found.', ja: '一致するアカウントが見つかりません。', ko: '일치하는 계정을 찾을 수 없습니다.', zh: '未找到匹配账户。', fr: 'Aucun compte correspondant.', de: 'Keine passenden Konten gefunden.', es: 'No se encontraron cuentas.' })}
                  </div>
                ) : users.map((user) => (
                  <UserRow key={user.id} user={user} onAction={runAction} language={language} roleLabelsMap={roleLabelsMap} tierLabelsMap={tierLabelsMap} statusLabelsMap={statusLabelsMap} />
                ))}
              </div>
            </Panel>
          </div>

          {/* Audit Logs Trail */}
          <Panel
            title={getMultiLangText(language, { vi: 'Nhật ký Hoạt động Hệ thống (Security Audit Trail)', en: 'Security Audit Trail & Admin Logs', ja: 'セキュリティ監査ログ & 管理ログ', ko: '보안 감사 로그 & 관리자 기록', zh: '安全审计日志与管理员记录', fr: 'Journal d\'audit de sécurité', de: 'Sicherheits-Audit-Protokoll', es: 'Registro de auditoría de seguridad' })}
            icon={History}
            subtitle={getMultiLangText(language, { vi: 'Theo dõi toàn bộ các thao tác đổi quyền, nâng gói tài khoản và tác vụ quản trị trong hệ thống.', en: 'Track all role updates, subscription upgrades, and admin actions.', ja: '役割更新、サブスクリプションアップグレード、管理者の操作履歴。', ko: '모든 역할 변경, 요금제 업그레이드 및 관리자 작업 추적.', zh: '追踪所有角色更新、订阅升级及管理员操作。', fr: 'Suivre toutes les mises à jour de rôles et actions admin.', de: 'Alle Rollenaktualisierungen und Admin-Aktionen nachverfolgen.', es: 'Rastrear todas las actualizaciones de roles y acciones de admin.' })}
          >
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 font-bold text-xs">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{log.action}</p>
                      <p className="text-[11px] text-slate-400">{getMultiLangText(language, { vi: 'Nguồn dữ liệu:', en: 'Source:', ja: 'ソース:', ko: '소스:', zh: '来源:', fr: 'Source :', de: 'Quelle:', es: 'Fuente:' })} <strong>{log.user}</strong></p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">{log.time}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 2: Quản lý nội dung / Kiểm duyệt viên (Content Manager / Moderator) */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{getMultiLangText(language, { vi: 'Nội dung', en: 'Content', ja: 'コンテンツ', ko: '콘텐츠', zh: '内容', fr: 'Contenu', de: 'Inhalte', es: 'Contenido' })}</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{data.contents.length}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{data.contents.filter((item) => item.isPublished).length} {getMultiLangText(language, { vi: 'đã xuất bản', en: 'published', ja: '公開済み', ko: '게시됨', zh: '已发布', fr: 'publiés', de: 'veröffentlicht', es: 'publicados' })}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{getMultiLangText(language, { vi: 'Mẫu lập kế hoạch', en: 'Planning templates', ja: '計画テンプレート', ko: '계획 템플릿', zh: '计划模板', fr: 'Modèles de planification', de: 'Planungsvorlagen', es: 'Plantillas de planificación' })}</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{data.templates.length}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{data.templates.filter((item) => item.isActive).length} {getMultiLangText(language, { vi: 'đang bật', en: 'active', ja: '有効', ko: '활성', zh: '启用', fr: 'actifs', de: 'aktiv', es: 'activos' })}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{getMultiLangText(language, { vi: 'Chiến dịch thông báo', en: 'Notification campaigns', ja: '通知キャンペーン', ko: '알림 캠페인', zh: '通知活动', fr: 'Campagnes de notification', de: 'Benachrichtigungskampagnen', es: 'Campañas de notificación' })}</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{data.campaigns.length}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{data.campaigns.filter((item) => item.status === 'SENT').length} {getMultiLangText(language, { vi: 'đã gửi', en: 'sent', ja: '送信済み', ko: '발송됨', zh: '已发送', fr: 'envoyées', de: 'gesendet', es: 'enviadas' })}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Panel
              title={getMultiLangText(language, { vi: 'Biên tập bài viết & thông báo hệ thống', en: 'Editorial content & system announcements', ja: '編集コンテンツ & システムお知らせ', ko: '편집 콘텐츠 & 시스템 공지', zh: '编辑内容与系统公告', fr: 'Contenus éditoriaux & annonces système', de: 'Redaktionelle Inhalte & Systemmitteilungen', es: 'Contenido editorial y anuncios del sistema' })}
              icon={FileText}
              subtitle={getMultiLangText(language, { vi: 'Tạo Handbook, nội dung trang chủ hoặc banner. Dữ liệu được lưu bằng API quản trị thật.', en: 'Create handbook articles, homepage content, or banners. Data is saved through the real admin API.', ja: 'Handbook、ホームページコンテンツ、バナーを作成します。データは実際の管理 API で保存されます。', ko: '핸드북, 홈 콘텐츠 또는 배너를 생성합니다. 데이터는 실제 관리자 API로 저장됩니다.', zh: '创建手册、主页内容或横幅。数据通过真实管理 API 保存。', fr: 'Créer des articles, contenus d’accueil ou bannières via l’API admin réelle.', de: 'Handbuchartikel, Startseiteninhalte oder Banner über die echte Admin-API erstellen.', es: 'Crea artículos, contenido de inicio o banners mediante la API real de administración.' })}
            >
              <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">{getMultiLangText(language, { vi: 'Loại nội dung', en: 'Content type', ja: 'コンテンツタイプ', ko: '콘텐츠 유형', zh: '内容类型', fr: 'Type de contenu', de: 'Inhaltstyp', es: 'Tipo de contenido' })}</label>
                    <Select value={contentForm.type} onChange={(v) => setContentForm({ ...contentForm, type: v as ContentType })} options={['HANDBOOK', 'HOMEPAGE', 'BANNER']} labels={contentTypeLabelsMap} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">{getMultiLangText(language, { vi: 'Tiêu đề', en: 'Title', ja: 'タイトル', ko: '제목', zh: '标题', fr: 'Titre', de: 'Titel', es: 'Título' })}</label>
                    <TextInput placeholder={getMultiLangText(language, { vi: 'Nhập tiêu đề bài viết hoặc thông báo...', en: 'Enter article or announcement title...', ja: '記事またはお知らせのタイトルを入力...', ko: '게시글 또는 공지 제목 입력...', zh: '输入文章或公告标题...', fr: 'Saisir le titre...', de: 'Titel eingeben...', es: 'Ingresa el título...' })} value={contentForm.title} onChange={(v) => setContentForm({ ...contentForm, title: v })} />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">{getMultiLangText(language, { vi: 'Nội dung', en: 'Body', ja: '本文', ko: '본문', zh: '正文', fr: 'Corps', de: 'Inhalt', es: 'Contenido' })}</label>
                    <TextArea placeholder={getMultiLangText(language, { vi: 'Viết nội dung hướng dẫn, thông báo hệ thống hoặc mẹo quản lý thời gian...', en: 'Write guide content, system announcements, or time management tips...', ja: 'ガイド本文、システムお知らせ、時間管理のヒントを書く...', ko: '가이드, 시스템 공지 또는 시간 관리 팁 작성...', zh: '编写指南、系统公告或时间管理技巧...', fr: 'Rédiger un guide, une annonce ou un conseil...', de: 'Leitfaden, Mitteilung oder Zeitmanagement-Tipp schreiben...', es: 'Escribe una guía, anuncio o consejo de gestión del tiempo...' })} value={contentForm.body} onChange={(v) => setContentForm({ ...contentForm, body: v })} />
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={contentForm.isPublished} onChange={(e) => setContentForm({ ...contentForm, isPublished: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
                    {getMultiLangText(language, { vi: 'Xuất bản ngay sau khi lưu', en: 'Publish immediately after saving', ja: '保存後すぐ公開', ko: '저장 후 즉시 게시', zh: '保存后立即发布', fr: 'Publier immédiatement après enregistrement', de: 'Nach dem Speichern sofort veröffentlichen', es: 'Publicar inmediatamente después de guardar' })}
                  </label>
                  <PrimaryButton disabled={isSaving || !contentForm.title.trim() || !contentForm.body.trim()} onClick={() => runAction(() => apiClient.post('/admin/content', contentForm), () => setContentForm(emptyContentForm))}>{getMultiLangText(language, { vi: 'Lưu nội dung', en: 'Save content', ja: 'コンテンツを保存', ko: '콘텐츠 저장', zh: '保存内容', fr: 'Enregistrer le contenu', de: 'Inhalt speichern', es: 'Guardar contenido' })}</PrimaryButton>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{getMultiLangText(language, { vi: 'Thư viện nội dung', en: 'Content library', ja: 'コンテンツライブラリ', ko: '콘텐츠 라이브러리', zh: '内容库', fr: 'Bibliothèque de contenu', de: 'Inhaltsbibliothek', es: 'Biblioteca de contenido' })}</h3>
                {data.contents.length === 0 ? <EmptyState text={getMultiLangText(language, { vi: 'Chưa có nội dung nào. Tạo bài viết đầu tiên bằng form phía trên.', en: 'No content yet. Create the first item using the form above.', ja: 'コンテンツはまだありません。上のフォームで最初の項目を作成してください。', ko: '아직 콘텐츠가 없습니다. 위 양식으로 첫 항목을 만드세요.', zh: '暂无内容。请使用上方表单创建第一条内容。', fr: 'Aucun contenu pour le moment. Créez le premier élément ci-dessus.', de: 'Noch keine Inhalte. Erstellen Sie den ersten Eintrag oben.', es: 'Aún no hay contenido. Crea el primer elemento arriba.' })} /> : data.contents.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2"><Badge>{contentTypeLabelsMap[item.type]}</Badge><span className={clsx('rounded-full px-2.5 py-1 text-[10px] font-semibold', item.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>{item.isPublished ? getMultiLangText(language, { vi: 'Đã xuất bản', en: 'Published', ja: '公開済み', ko: '게시됨', zh: '已发布', fr: 'Publié', de: 'Veröffentlicht', es: 'Publicado' }) : getMultiLangText(language, { vi: 'Bản nháp', en: 'Draft', ja: '下書き', ko: '초안', zh: '草稿', fr: 'Brouillon', de: 'Entwurf', es: 'Borrador' })}</span></div>
                        <p className="truncate text-sm font-semibold text-slate-950">{item.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.body}</p>
                        <p className="mt-2 text-[11px] font-medium text-slate-400">{new Date(item.updatedAt).toLocaleString(language === 'vi' ? 'vi-VN' : undefined)}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button type="button" onClick={() => runAction(() => apiClient.patch(`/admin/content/${item.id}`, { isPublished: !item.isPublished }))} className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">{item.isPublished ? getMultiLangText(language, { vi: 'Ẩn', en: 'Unpublish', ja: '非公開', ko: '게시 해제', zh: '取消发布', fr: 'Dépublier', de: 'Zurückziehen', es: 'Despublicar' }) : getMultiLangText(language, { vi: 'Xuất bản', en: 'Publish', ja: '公開', ko: '게시', zh: '发布', fr: 'Publier', de: 'Veröffentlichen', es: 'Publicar' })}</button>
                        <button type="button" onClick={() => runAction(() => apiClient.delete(`/admin/content/${item.id}`))} className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">{getMultiLangText(language, { vi: 'Xóa', en: 'Delete', ja: '削除', ko: '삭제', zh: '删除', fr: 'Supprimer', de: 'Löschen', es: 'Eliminar' })}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title={getMultiLangText(language, { vi: 'Kiểm duyệt mẫu lập kế hoạch', en: 'Planning template moderation', ja: '計画テンプレート審査', ko: '계획 템플릿 검수', zh: '计划模板审核', fr: 'Modération des modèles', de: 'Vorlagenmoderation', es: 'Moderación de plantillas' })} icon={Tags} subtitle={getMultiLangText(language, { vi: 'Tạo mẫu chuẩn, bật/tắt trạng thái sử dụng hoặc gỡ mẫu không phù hợp.', en: 'Create standard templates, toggle availability, or remove unsuitable templates.', ja: '標準テンプレートを作成し、有効/無効を切り替え、不適切なテンプレートを削除します。', ko: '표준 템플릿을 생성하고 사용 가능 상태를 전환하거나 부적합한 템플릿을 제거합니다.', zh: '创建标准模板，切换可用状态或移除不合适模板。', fr: 'Créer, activer/désactiver ou retirer des modèles.', de: 'Vorlagen erstellen, aktivieren/deaktivieren oder entfernen.', es: 'Crea, activa/desactiva o elimina plantillas.' })}>
              <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-4"><div className="grid gap-3"><TextInput placeholder={getMultiLangText(language, { vi: 'Tên mẫu lập kế hoạch', en: 'Template name', ja: 'テンプレート名', ko: '템플릿 이름', zh: '模板名称', fr: 'Nom du modèle', de: 'Vorlagenname', es: 'Nombre de plantilla' })} value={templateForm.name} onChange={(v) => setTemplateForm({ ...templateForm, name: v })} /><Select value={templateForm.type} onChange={(v) => setTemplateForm({ ...templateForm, type: v as CategoryType })} options={['STUDY', 'WORK', 'TASK', 'MEETING', 'PERSONAL', 'HABIT', 'DEADLINE']} labels={categoryTypeLabelsMap} /><TextInput placeholder={getMultiLangText(language, { vi: 'Mô tả mẫu', en: 'Template description', ja: 'テンプレート説明', ko: '템플릿 설명', zh: '模板描述', fr: 'Description du modèle', de: 'Vorlagenbeschreibung', es: 'Descripción de la plantilla' })} value={templateForm.description} onChange={(v) => setTemplateForm({ ...templateForm, description: v })} /><PrimaryButton disabled={isSaving || !templateForm.name.trim()} onClick={() => runAction(() => apiClient.post('/admin/system/category-templates', templateForm), () => setTemplateForm(emptyTemplateForm))}>{getMultiLangText(language, { vi: 'Tạo mẫu chuẩn', en: 'Create standard template', ja: '標準テンプレート作成', ko: '표준 템플릿 생성', zh: '创建标准模板', fr: 'Créer un modèle standard', de: 'Standardvorlage erstellen', es: 'Crear plantilla estándar' })}</PrimaryButton></div></div>
              <div className="space-y-3"><h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{getMultiLangText(language, { vi: 'Danh sách mẫu', en: 'Template list', ja: 'テンプレート一覧', ko: '템플릿 목록', zh: '模板列表', fr: 'Liste des modèles', de: 'Vorlagenliste', es: 'Lista de plantillas' })}</h3>{data.templates.length === 0 ? <EmptyState text={getMultiLangText(language, { vi: 'Chưa có mẫu lập kế hoạch nào.', en: 'No planning templates yet.', ja: '計画テンプレートはまだありません。', ko: '아직 계획 템플릿이 없습니다.', zh: '暂无计划模板。', fr: 'Aucun modèle pour le moment.', de: 'Noch keine Planungsvorlagen.', es: 'Aún no hay plantillas.' })} /> : data.templates.map((item) => (<div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-2 flex flex-wrap items-center gap-2"><Badge>{categoryTypeLabelsMap[item.type]}</Badge><span className={clsx('rounded-full px-2.5 py-1 text-[10px] font-semibold', item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600')}>{item.isActive ? getMultiLangText(language, { vi: 'Đang bật', en: 'Active', ja: '有効', ko: '활성', zh: '已启用', fr: 'Actif', de: 'Aktiv', es: 'Activo' }) : getMultiLangText(language, { vi: 'Đã tắt', en: 'Inactive', ja: '無効', ko: '비활성', zh: '已停用', fr: 'Inactif', de: 'Inaktiv', es: 'Inactivo' })}</span></div><p className="text-sm font-semibold text-slate-950">{item.name}</p>{item.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.description}</p>}<div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => runAction(() => apiClient.patch(`/admin/system/category-templates/${item.id}`, { isActive: !item.isActive }))} className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">{item.isActive ? getMultiLangText(language, { vi: 'Tắt mẫu', en: 'Disable', ja: '無効化', ko: '비활성화', zh: '停用', fr: 'Désactiver', de: 'Deaktivieren', es: 'Desactivar' }) : getMultiLangText(language, { vi: 'Bật mẫu', en: 'Enable', ja: '有効化', ko: '활성화', zh: '启用', fr: 'Activer', de: 'Aktivieren', es: 'Activar' })}</button><button type="button" onClick={() => runAction(() => apiClient.delete(`/admin/system/category-templates/${item.id}`))} className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">{getMultiLangText(language, { vi: 'Gỡ bỏ', en: 'Remove', ja: '削除', ko: '삭제', zh: '移除', fr: 'Supprimer', de: 'Entfernen', es: 'Eliminar' })}</button></div></div>))}</div>
            </Panel>
          </div>

          <Panel title={getMultiLangText(language, { vi: 'Chiến dịch thông báo & mẹo quản lý thời gian', en: 'Notification campaigns & time management tips', ja: '通知キャンペーン & 時間管理のヒント', ko: '알림 캠페인 & 시간 관리 팁', zh: '通知活动与时间管理技巧', fr: 'Campagnes de notification & conseils', de: 'Benachrichtigungskampagnen & Zeitmanagement-Tipps', es: 'Campañas de notificación y consejos' })} icon={Megaphone} subtitle={getMultiLangText(language, { vi: 'Soạn thông báo, chọn nhóm tài khoản nhận và gửi chiến dịch đến hệ thống thông báo thật.', en: 'Compose notifications, choose the target account group, and send campaigns through the real notification system.', ja: '通知を作成し、対象アカウントを選択して実通知システムから送信します。', ko: '알림을 작성하고 대상 계정 그룹을 선택하여 실제 알림 시스템으로 발송합니다.', zh: '撰写通知，选择目标账户组，并通过真实通知系统发送。', fr: 'Composer une notification, choisir l’audience et l’envoyer via le système réel.', de: 'Benachrichtigung verfassen, Zielgruppe wählen und über das echte System senden.', es: 'Redacta notificaciones, elige audiencia y envíalas por el sistema real.' })}>
            <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-4"><div className="grid gap-3 lg:grid-cols-[1fr_260px]"><TextInput placeholder={getMultiLangText(language, { vi: 'Tiêu đề thông báo', en: 'Notification title', ja: '通知タイトル', ko: '알림 제목', zh: '通知标题', fr: 'Titre de la notification', de: 'Titel der Benachrichtigung', es: 'Título de la notificación' })} value={campaignForm.title} onChange={(v) => setCampaignForm({ ...campaignForm, title: v })} /><Select value={campaignForm.audience} onChange={(v) => setCampaignForm({ ...campaignForm, audience: v as '' | Tier })} options={['', 'FREE', 'PREMIUM', 'VIP', 'INTERNAL']} labels={{ '': getMultiLangText(language, { vi: 'Tất cả tài khoản', en: 'All accounts', ja: '全アカウント', ko: '모든 계정', zh: '所有账户', fr: 'Tous les comptes', de: 'Alle Konten', es: 'Todas las cuentas' }), ...tierLabelsMap }} /><div className="lg:col-span-2"><TextArea placeholder={getMultiLangText(language, { vi: 'Nội dung thông báo hoặc mẹo quản lý thời gian...', en: 'Notification message or time management tip...', ja: '通知本文または時間管理のヒント...', ko: '알림 내용 또는 시간 관리 팁...', zh: '通知内容或时间管理技巧...', fr: 'Message ou conseil de gestion du temps...', de: 'Benachrichtigung oder Zeitmanagement-Tipp...', es: 'Mensaje o consejo de gestión del tiempo...' })} value={campaignForm.message} onChange={(v) => setCampaignForm({ ...campaignForm, message: v })} /></div></div><div className="mt-4 flex justify-end"><PrimaryButton disabled={isSaving || !campaignForm.title.trim() || !campaignForm.message.trim()} onClick={() => runAction(() => apiClient.post('/admin/notification-campaigns', { ...campaignForm, audience: campaignForm.audience || null }), () => setCampaignForm(emptyCampaignForm))}>{getMultiLangText(language, { vi: 'Tạo chiến dịch', en: 'Create campaign', ja: 'キャンペーン作成', ko: '캠페인 생성', zh: '创建活动', fr: 'Créer la campagne', de: 'Kampagne erstellen', es: 'Crear campaña' })}</PrimaryButton></div></div>
            <div className="grid gap-3 xl:grid-cols-2">{data.campaigns.length === 0 ? <div className="xl:col-span-2"><EmptyState text={getMultiLangText(language, { vi: 'Chưa có chiến dịch thông báo nào.', en: 'No notification campaigns yet.', ja: '通知キャンペーンはまだありません。', ko: '아직 알림 캠페인이 없습니다.', zh: '暂无通知活动。', fr: 'Aucune campagne pour le moment.', de: 'Noch keine Benachrichtigungskampagnen.', es: 'Aún no hay campañas.' })} /></div> : data.campaigns.map((item) => (<div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-2 flex flex-wrap items-center gap-2"><span className={clsx('rounded-full px-2.5 py-1 text-[10px] font-semibold', item.status === 'SENT' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>{item.status === 'SENT' ? getMultiLangText(language, { vi: 'Đã gửi', en: 'Sent', ja: '送信済み', ko: '발송됨', zh: '已发送', fr: 'Envoyée', de: 'Gesendet', es: 'Enviada' }) : getMultiLangText(language, { vi: 'Bản nháp', en: 'Draft', ja: '下書き', ko: '초안', zh: '草稿', fr: 'Brouillon', de: 'Entwurf', es: 'Borrador' })}</span><Badge>{item.audience ? tierLabelsMap[item.audience] : getMultiLangText(language, { vi: 'Tất cả tài khoản', en: 'All accounts', ja: '全アカウント', ko: '모든 계정', zh: '所有账户', fr: 'Tous les comptes', de: 'Alle Konten', es: 'Todas las cuentas' })}</Badge></div><p className="text-sm font-semibold text-slate-950">{item.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.message}</p><p className="mt-2 text-[11px] font-medium text-slate-400">{item.recipientsCount} {getMultiLangText(language, { vi: 'người nhận', en: 'recipients', ja: '受信者', ko: '수신자', zh: '接收者', fr: 'destinataires', de: 'Empfänger', es: 'destinatarios' })}</p>{item.status === 'DRAFT' && <div className="mt-3 flex justify-end"><button type="button" onClick={() => runAction(() => apiClient.post(`/admin/notification-campaigns/${item.id}/send`))} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700">{getMultiLangText(language, { vi: 'Gửi ngay', en: 'Send now', ja: '今すぐ送信', ko: '지금 발송', zh: '立即发送', fr: 'Envoyer maintenant', de: 'Jetzt senden', es: 'Enviar ahora' })}</button></div>}</div>))}</div>
          </Panel>
        </div>
      )}
      {/* TAB 3: Chăm sóc khách hàng / Hỗ trợ viên (Customer Support / CS) */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            {/* Ticket Management Panel */}
            <Panel
              title={getMultiLangText(language, { vi: 'Trung tâm Tiếp nhận & Phản hồi Ticket CS', en: 'CS Ticket reception & response center', ja: 'CS チケット受付 & 返信センター', ko: 'CS 티켓 접수 & 응대 센터', zh: 'CS 工单接收与回复中心', fr: 'Centre de réception & réponse aux tickets CS', de: 'CS Ticket-Empfangs- & Antwortzentrum', es: 'Centro de recepción y respuesta de tickets CS' })}
              icon={Headphones}
              subtitle={getMultiLangText(language, { vi: 'Tiếp nhận và xử lý sự cố kỹ thuật của người dùng.', en: 'Receive and resolve technical issues for users.', ja: 'ユーザーの技術的障害の受付・処理。', ko: '사용자의 기술적 문제 접수 및 해결.', zh: '接收与解决用户的技术问题。', fr: 'Recevoir et résoudre les problèmes techniques des utilisateurs.', de: 'Technische Probleme von Benutzern empfangen und lösen.', es: 'Recibir y resolver problemas técnicos de los usuarios.' })}
            >
              {/* Quick Reply Macros */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Mẫu phản hồi nhanh CS:</span>
                <button
                  type="button"
                  onClick={() => setTicketForm({ ...ticketForm, message: 'Chào bạn, chúng tôi đã ghi nhận sự cố đồng bộ lịch. Vui lòng thử bấm "Đồng bộ lại" trong mục Cài đặt.' })}
                  className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                >
                  ⚡ Mẫu 1: Lỗi đồng bộ
                </button>
                <button
                  type="button"
                  onClick={() => setTicketForm({ ...ticketForm, message: 'Chào bạn, gói tài khoản VIP của bạn đã được kích hoạt thành công. Vui lòng đăng xuất và đăng nhập lại.' })}
                  className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-100 transition"
                >
                  ⚡ Mẫu 2: Kích hoạt VIP
                </button>
              </div>

              <div className="mb-5 grid gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <h3 className="text-xs font-semibold uppercase text-slate-600">
                  {getMultiLangText(language, { vi: 'Tạo ticket hỗ trợ mới cho khách hàng:', en: 'Create new support ticket for customer:', ja: '新規サポートチケットを作成:', ko: '고객용 신규 지원 티켓 생성:', zh: '为客户创建新支持工单:', fr: 'Créer un nouveau ticket de support :', de: 'Neues Support-Ticket erstellen:', es: 'Crear nuevo ticket de soporte:' })}
                </h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <Select value={ticketForm.userId} onChange={(v) => setTicketForm({ ...ticketForm, userId: v })} options={data.users.map((u) => u.id)} labels={Object.fromEntries(data.users.map((u) => [u.id, `${u.name} (${u.email})`]))} />
                  <TextInput placeholder={getMultiLangText(language, { vi: 'Chủ đề sự cố', en: 'Issue subject', ja: '問題の件名', ko: '문제 제목', zh: '问题主题', fr: 'Sujet du problème', de: 'Betreff des Problems', es: 'Asunto del problema' })} value={ticketForm.subject} onChange={(v) => setTicketForm({ ...ticketForm, subject: v })} />
                </div>
                <TextInput placeholder={getMultiLangText(language, { vi: 'Mô tả sự cố người dùng gặp phải...', en: 'Describe the issue user is facing...', ja: 'ユーザーが直面している問題を記述...', ko: '사용자가 겪고 있는 문제 설명...', zh: '描述用户遇到的问题...', fr: 'Décrivez le problème rencontré par l\'utilisateur...', de: 'Beschreiben Sie das Problem des Benutzers...', es: 'Describa el problema que enfrenta el usuario...' })} value={ticketForm.message} onChange={(v) => setTicketForm({ ...ticketForm, message: v })} />
                <PrimaryButton disabled={isSaving} onClick={() => runAction(() => apiClient.post('/admin/support/tickets', ticketForm), () => setTicketForm(emptyTicketForm))}>
                  {getMultiLangText(language, { vi: '+ Mở ticket hỗ trợ', en: '+ Open support ticket', ja: '+ サポートチケットを開く', ko: '+ 지원 티켓 오픈', zh: '+ 打开支持工单', fr: '+ Ouvrir un ticket de support', de: '+ Support-Ticket öffnen', es: '+ Abrir ticket de soporte' })}
                </PrimaryButton>
              </div>

              <div className="space-y-3">
                {data.tickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} onAction={runAction} language={language} ticketLabelsMap={ticketLabelsMap} />
                ))}
              </div>
            </Panel>

            {/* Customer 360 & CS Notes */}
            <div className="space-y-6">
              <Panel
                title={getMultiLangText(language, { vi: 'Hồ sơ Tra cứu Khách hàng 360°', en: 'Customer 360° Profile Inspector', ja: '顧客 360° プロファイル確認', ko: '고객 360° 프로필 조회', zh: '客户 360° 档案精查', fr: 'Inspecteur de profil client 360°', de: 'Kunden 360°-Profilprüfung', es: 'Inspector de perfil de cliente 360°' })}
                icon={UserCog}
                subtitle={getMultiLangText(language, { vi: 'Xem chi tiết trạng thái tài khoản cơ bản và lịch sử để hỗ trợ khách hàng nhanh chóng.', en: 'Inspect account status details to assist customers quickly.', ja: '迅速なサポートのために詳細なアカウント状態を確認。', ko: '신속한 지원을 위한 상세 계정 상태 조회.', zh: '查阅详细账户状态以快速为客户提供协助。', fr: 'Inspecter les détails de statut de compte.', de: 'Kontostatusdetails prüfen.', es: 'Inspeccionar detalles de estado de cuenta.' })}
              >
                <div className="mb-4">
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    {getMultiLangText(language, { vi: 'Chọn tài khoản khách hàng:', en: 'Select customer account:', ja: '顧客アカウントを選択:', ko: '고객 계정 선택:', zh: '选择客户账户:', fr: 'Sélectionner le compte client :', de: 'Kundenkonto auswählen:', es: 'Seleccionar cuenta de cliente:' })}
                  </label>
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
                        <h3 className="text-base font-bold text-slate-900">{selectedCsUser.name}</h3>
                        <p className="text-xs text-slate-500">{selectedCsUser.email}</p>
                      </div>
                      <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold border', roleBadgeColors[selectedCsUser.role])}>
                        {roleLabelsMap[selectedCsUser.role]}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                      <div className="rounded-xl bg-white p-3 border border-indigo-100">
                        <span className="text-slate-400">{getMultiLangText(language, { vi: 'Gói tài khoản:', en: 'Account tier:', ja: 'アカウントプラン:', ko: '계정 플랜:', zh: '账户套餐:', fr: 'Forfait :', de: 'Kontoplan:', es: 'Plan:' })}</span>
                        <p className="text-indigo-600 font-bold mt-0.5">{tierLabelsMap[selectedCsUser.accountTier]}</p>
                      </div>
                      <div className="rounded-xl bg-white p-3 border border-indigo-100">
                        <span className="text-slate-400">{getMultiLangText(language, { vi: 'Trạng thái:', en: 'Status:', ja: 'ステータス:', ko: '상태:', zh: '状态:', fr: 'Statut :', de: 'Status:', es: 'Estado:' })}</span>
                        <p className="text-emerald-600 font-bold mt-0.5">{statusLabelsMap[selectedCsUser.status]}</p>
                      </div>
                      <div className="rounded-xl bg-white p-3 border border-indigo-100">
                        <span className="text-slate-400">{getMultiLangText(language, { vi: 'Số Task đã tạo:', en: 'Created tasks count:', ja: '作成済みタスク数:', ko: '생성된 작업 수:', zh: '已创任务数:', fr: 'Tâches créées :', de: 'Erstellte Aufgaben:', es: 'Tareas creadas:' })}</span>
                        <p className="text-slate-900 font-bold mt-0.5">{selectedCsUser._count.tasks} {getMultiLangText(language, { vi: 'công việc', en: 'tasks', ja: '件のタスク', ko: '개 작업', zh: '个任务', fr: 'tâches', de: 'Aufgaben', es: 'tareas' })}</p>
                      </div>
                      <div className="rounded-xl bg-white p-3 border border-indigo-100">
                        <span className="text-slate-400">{getMultiLangText(language, { vi: 'Sự kiện & Lịch:', en: 'Events & schedule:', ja: 'イベント & 予定:', ko: '이벤트 & 일정:', zh: '事件与日程:', fr: 'Événements & planning :', de: 'Termine & Zeitplan:', es: 'Eventos y horario:' })}</span>
                        <p className="text-slate-900 font-bold mt-0.5">{selectedCsUser._count.events} {getMultiLangText(language, { vi: 'sự kiện', en: 'events', ja: '件のイベント', ko: '개 이벤트', zh: '个事件', fr: 'événements', de: 'Termine', es: 'eventos' })}</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white p-3 border border-indigo-100 text-xs">
                      <span className="text-slate-400">{getMultiLangText(language, { vi: 'Đăng nhập gần nhất:', en: 'Last active:', ja: '最終ログイン:', ko: '최근 활동:', zh: '最近登录:', fr: 'Dernière activité :', de: 'Zuletzt aktiv:', es: 'Última actividad:' })}</span>
                      <p className="font-bold text-slate-700 mt-0.5">
                        {selectedCsUser.lastActiveAt ? new Date(selectedCsUser.lastActiveAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US') : getMultiLangText(language, { vi: 'Chưa có dữ liệu', en: 'No data yet', ja: 'データなし', ko: '데이터 없음', zh: '暂无数据', fr: 'Aucune donnée', de: 'Keine Daten', es: 'Sin datos' })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">{getMultiLangText(language, { vi: 'Chưa chọn tài khoản.', en: 'No account selected.', ja: 'アカウントが選択されていません。', ko: '계정이 선택되지 않았습니다.', zh: '未选择账户。', fr: 'Aucun compte sélectionné.', de: 'Kein Konto ausgewählt.', es: 'Ninguna cuenta seleccionada.' })}</p>
                )}
              </Panel>

              {/* Internal CS Notes */}
              <Panel
                title="Ghi chú Nội bộ Chăm sóc Khách hàng"
                icon={MessageSquare}
                subtitle="Lưu lại lịch sử trao đổi hoặc lưu ý cho khách hàng đang chọn."
              >
                <div className="space-y-3 mb-4">
                  <div className="flex gap-2">
                    <TextInput placeholder="Nhập ghi chú hỗ trợ mới cho khách hàng này..." value={newCsNoteText} onChange={setNewCsNoteText} />
                    <PrimaryButton onClick={handleAddCsNote}>+ Thêm</PrimaryButton>
                  </div>
                </div>

                <div className="space-y-2">
                  {csNotes.map((note) => (
                    <div key={note.id} className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>👤 {note.agent}</span>
                        <span className="text-[10px] font-semibold text-slate-400">{note.date}</span>
                      </div>
                      <p className="mt-1 text-slate-600 leading-relaxed">{note.note}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && <TeamWorkspace />}

      {/* TAB SYSTEM CONFIGS */}
      {activeTab === 'system' && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel
            title={getMultiLangText(language, { vi: 'Cấu hình AI / Tự động hóa', en: 'AI & automation configuration', ja: 'AI & 自動化設定', ko: 'AI & 자동화 설정', zh: 'AI 与自动化配置', fr: 'Configuration IA & automatisation', de: 'KI & Automatisierungskonfiguration', es: 'Configuración de IA y automatización' })}
            icon={Bot}
            subtitle={getMultiLangText(language, { vi: 'Tinh chỉnh thông số gợi ý lịch trình thông minh.', en: 'Tweak smart schedule suggestion parameters.', ja: 'スマート スケジュール提案のパラメータを調整。', ko: '스마트 일정 추천 매개변수 조정.', zh: '微调智能日程推荐参数。', fr: 'Ajuster les paramètres de suggestion IA.', de: 'Intelligente Vorschlagsparameter anpassen.', es: 'Ajustar parámetros de sugerencias con IA.' })}
          >
            <div className="mb-5 grid gap-3 md:grid-cols-2">
              <TextInput placeholder={getMultiLangText(language, { vi: 'Khóa cấu hình', en: 'Config key', ja: '設定キー', ko: '설정 키', zh: '配置键', fr: 'Clé de conf', de: 'Konfigurationsschlüssel', es: 'Clave de conf.' })} value={configForm.key} onChange={(v) => setConfigForm({ ...configForm, key: v })} />
              <TextInput placeholder={getMultiLangText(language, { vi: 'Tên hiển thị', en: 'Display name', ja: '表示名', ko: '표시 이름', zh: '显示名称', fr: 'Nom d\'affichage', de: 'Anzeigename', es: 'Nombre para mostrar' })} value={configForm.label} onChange={(v) => setConfigForm({ ...configForm, label: v })} />
              <TextInput placeholder={getMultiLangText(language, { vi: 'Giá trị', en: 'Value', ja: '値', ko: '값', zh: '值', fr: 'Valeur', de: 'Wert', es: 'Valor' })} value={configForm.value} onChange={(v) => setConfigForm({ ...configForm, value: v })} />
              <TextInput placeholder={getMultiLangText(language, { vi: 'Mô tả', en: 'Description', ja: '説明', ko: '설명', zh: '描述', fr: 'Description', de: 'Beschreibung', es: 'Descripción' })} value={configForm.description} onChange={(v) => setConfigForm({ ...configForm, description: v })} />
              <PrimaryButton disabled={isSaving} onClick={() => runAction(() => apiClient.post('/admin/system/configs', buildConfigPayload()), () => setConfigForm(emptyConfigForm))}>
                {getMultiLangText(language, { vi: 'Lưu cấu hình', en: 'Save config', ja: '設定を保存', ko: '설정 저장', zh: '保存配置', fr: 'Enregistrer', de: 'Speichern', es: 'Guardar' })}
              </PrimaryButton>
            </div>
            <List rows={data.configs.map((c) => {
              const display = getSystemConfigText(c.key, c.label, c.description);
              return { id: c.id, title: display.label, meta: `${c.key} = ${c.value}`, desc: display.description, onDelete: () => runAction(() => apiClient.delete(`/admin/system/configs/${c.id}`)) };
            })} />
          </Panel>

          <Panel
            title={getMultiLangText(language, { vi: 'Phân tích dùng tính năng', en: 'Feature usage analytics', ja: '機能利用状況分析', ko: '기능 사용 분석', zh: '功能使用分析', fr: 'Analyse d\'utilisation des fonctionnalités', de: 'Funktionsnutzungsanalyse', es: 'Análisis de uso de funciones' })}
            icon={Settings2}
            subtitle={getMultiLangText(language, { vi: 'Tổng hợp dữ liệu thật theo module.', en: 'Aggregated usage stats by module.', ja: 'モジュールごとの実際の利用データ集計。', ko: '모듈별 실제 사용 데이터 집계.', zh: '按模块汇总真实使用数据。', fr: 'Statistiques agrégées par module.', de: 'Aggregierte Nutzungsdaten nach Modul.', es: 'Estadísticas agregadas por módulo.' })}
          >
            <List rows={Object.entries(data.analytics.featureUsage).map(([key, value]) => ({ id: key, title: getFeatureUsageLabel(key), meta: `${value}`, desc: getMultiLangText(language, { vi: 'Lượt dữ liệu đã phát sinh', en: 'Total data entries generated', ja: '発生データ件数', ko: '생성된 데이터 건수', zh: '已产生数据记录', fr: 'Données générées', de: 'Generierte Datenzeilen', es: 'Registros de datos generados' }) }))} />
          </Panel>
        </div>
      )}
    </div>
  );
};

/* Helper Components */
const RoleHeroBanner = ({ title, subtitle, gradient, accentColor, badgeText, icon: Icon }: { title: string; subtitle: string; gradient: string; accentColor: string; badgeText: string; icon: any }) => (
  <section className={clsx('relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br px-7 py-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]', gradient)}>
    <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08)_0,transparent_32%)]" />
    <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-white/12 shadow-2xl shadow-black/10 backdrop-blur-md">
          <Icon className={clsx('h-8 w-8', accentColor)} />
        </div>
        <div className="min-w-0">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur-md">
            {badgeText}
          </div>
          <h1 className="mt-3 max-w-5xl text-2xl font-bold leading-tight tracking-[-0.02em] md:text-3xl">{title}</h1>
          <p className="mt-2 max-w-4xl text-sm font-medium leading-6 text-white/80">{subtitle}</p>
        </div>
      </div>
    </div>
  </section>
);

const Panel = ({ title, subtitle, icon: Icon, children, className = '' }: any) => (
  <section className={clsx('rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm', className)}>
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
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
    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-400 focus:bg-white"
  />
);

const TextArea = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={3}
    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-400 focus:bg-white"
  />
);

const Select = ({ value, onChange, options, labels = {} }: { value: string; onChange: (v: string) => void; options: string[]; labels?: Record<string, string> }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-400 focus:bg-white"
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
    className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 transition active:scale-95"
  >
    {children}
  </button>
);

const FilterPill = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={clsx(
      'rounded-xl px-3 py-1.5 text-[11px] font-semibold transition',
      active ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    )}
  >
    {label}
  </button>
);

const UserRow = ({
  user,
  onAction,
  language,
  roleLabelsMap,
  tierLabelsMap,
  statusLabelsMap,
}: {
  user: AdminUser;
  onAction: (a: () => Promise<unknown>) => void;
  language: string;
  roleLabelsMap: Record<Role, string>;
  tierLabelsMap: Record<Tier, string>;
  statusLabelsMap: Record<Status, string>;
}) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:border-slate-300 transition">
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <p className="font-bold text-slate-950 text-sm">{user.name}</p>
          <span className={clsx('rounded-full px-2.5 py-0.5 text-[10px] font-semibold border', roleBadgeColors[user.role])}>
            {roleLabelsMap[user.role]}
          </span>
        </div>
        <p className="text-xs font-medium text-slate-500">{user.email}</p>
        <p className="mt-1 text-[11px] text-slate-400">
          {user._count.tasks} task · {user._count.events} {getMultiLangText(language, { vi: 'sự kiện', en: 'events', ja: 'イベント', ko: '이벤트', zh: '事件', fr: 'événements', de: 'Termine', es: 'eventos' })} · {getMultiLangText(language, { vi: 'Hoạt động:', en: 'Active:', ja: 'アクティブ:', ko: '활동:', zh: '活跃:', fr: 'Actif :', de: 'Aktiv:', es: 'Activo:' })} {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US') : getMultiLangText(language, { vi: 'chưa có', en: 'none', ja: 'なし', ko: '없음', zh: '暂无', fr: 'aucun', de: 'keine', es: 'ninguna' })}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge>{tierLabelsMap[user.accountTier]}</Badge>
        <Badge>{statusLabelsMap[user.status]}</Badge>
        {user.isVerified ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{getMultiLangText(language, { vi: 'Đã xác minh', en: 'Verified', ja: '認証済み', ko: '인증됨', zh: '已验证', fr: 'Vérifié', de: 'Verifiziert', es: 'Verificado' })}</span> : null}
      </div>
    </div>

    <div className="mt-3 grid gap-2 md:grid-cols-5">
      <ActionSelect
        value={user.role}
        options={['USER', 'ADMIN', 'CONTENT_MANAGER', 'CUSTOMER_SUPPORT', 'ENTERPRISE_LEAD']}
        labels={roleLabelsMap}
        onChange={(v) => onAction(() => apiClient.patch(`/admin/users/${user.id}/account`, { role: v }))}
      />
      <ActionSelect
        value={user.accountTier}
        options={['FREE', 'PREMIUM', 'VIP', 'INTERNAL']}
        labels={tierLabelsMap}
        onChange={(v) => onAction(() => apiClient.patch(`/admin/users/${user.id}/account`, { accountTier: v }))}
      />
      <ActionSelect
        value={user.status}
        options={['ACTIVE', 'LOCKED']}
        labels={statusLabelsMap}
        onChange={(v) => onAction(() => apiClient.patch(`/admin/users/${user.id}/account`, { status: v }))}
      />
      <button
        onClick={() => onAction(() => apiClient.patch(`/admin/users/${user.id}/account`, { isVerified: !user.isVerified }))}
        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        {user.isVerified
          ? getMultiLangText(language, { vi: 'Bỏ xác minh', en: 'Unverify', ja: '認証解除', ko: '인증 해제', zh: '取消验证', fr: 'Annuler la vérification', de: 'Verifizierung aufheben', es: 'Cancelar verificación' })
          : getMultiLangText(language, { vi: 'Xác minh', en: 'Verify', ja: '認証する', ko: '인증하기', zh: '验证', fr: 'Vérifier', de: 'Verifizieren', es: 'Verificar' })}
      </button>
      {user.role !== 'ADMIN' && (
        <button
          onClick={() => window.confirm(`Delete ${user.email}?`) && onAction(() => apiClient.delete(`/admin/users/${user.id}`))}
          className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
        >
          <Trash2 className="inline h-3.5 w-3.5 text-rose-600 mr-1" />
          {getMultiLangText(language, { vi: 'Xóa', en: 'Delete', ja: '削除', ko: '삭제', zh: '删除', fr: 'Supprimer', de: 'Löschen', es: 'Eliminar' })}
        </button>
      )}
    </div>
  </div>
);

const TicketCard = ({
  ticket,
  onAction,
  language,
  ticketLabelsMap,
}: {
  ticket: Ticket;
  onAction: (a: () => Promise<unknown>) => void;
  language: string;
  ticketLabelsMap: Record<TicketStatus, string>;
}) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-bold text-slate-950 text-sm">{ticket.subject}</p>
        <p className="text-xs font-medium text-slate-500">
          {getMultiLangText(language, { vi: 'Gửi bởi:', en: 'Sent by:', ja: '送信者:', ko: '보낸 사람:', zh: '发送者:', fr: 'Envoyé par :', de: 'Gesendet von:', es: 'Enviado por:' })} {ticket.user.email}
        </p>
      </div>
      <Badge>{ticketLabelsMap[ticket.status]}</Badge>
    </div>
    <p className="mt-2 text-xs leading-relaxed text-slate-700 bg-white p-3 rounded-xl border border-slate-200">{ticket.message}</p>
    {ticket.adminReply && (
      <p className="mt-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-900">
        💬 {getMultiLangText(language, { vi: 'Phản hồi CS:', en: 'CS Reply:', ja: 'CS 返信:', ko: 'CS 답글:', zh: '客服回复:', fr: 'Réponse CS :', de: 'CS-Antwort:', es: 'Respuesta CS:' })} {ticket.adminReply}
      </p>
    )}
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <ActionSelect
        value={ticket.status}
        options={['OPEN', 'IN_PROGRESS', 'RESOLVED']}
        labels={ticketLabelsMap}
        onChange={(v) => onAction(() => apiClient.patch(`/admin/support/tickets/${ticket.id}`, { status: v }))}
      />
      <button
        onClick={() => {
          const reply = window.prompt(getMultiLangText(language, { vi: 'Nhập phản hồi chăm sóc khách hàng:', en: 'Enter customer support reply:', ja: 'カスタマーサポートの返信を入力:', ko: '고객 지원 답글 입력:', zh: '输入客服回复:', fr: 'Saisissez la réponse :', de: 'Antwort eingeben:', es: 'Ingrese la respuesta:' }), ticket.adminReply || '');
          if (reply !== null) onAction(() => apiClient.patch(`/admin/support/tickets/${ticket.id}`, { adminReply: reply, status: 'RESOLVED' }));
        }}
        className="rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
      >
        💬 {getMultiLangText(language, { vi: 'Phản hồi CS', en: 'CS Reply', ja: 'CS 返信', ko: 'CS 답글', zh: '客服回复', fr: 'Réponse CS', de: 'CS-Antwort', es: 'Respuesta CS' })}
      </button>
    </div>
  </div>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full bg-slate-200/60 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">{children}</span>
);

const ActionSelect = ({ value, options, labels = {}, onChange }: { value: string; options: string[]; labels?: Record<string, string>; onChange: (v: string) => void }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400"
  >
    {options.map((o) => (
      <option key={o} value={o}>
        {labels[o] || o}
      </option>
    ))}
  </select>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs font-medium text-slate-500">
    {text}
  </div>
);
const List = ({ rows }: { rows: { id: string; title: string; meta: string; desc?: string; onDelete?: () => void; actionLabel?: React.ReactNode }[] }) => {
  const { data: settings } = useSettings();
  const language = normalizeLanguage(settings?.language);

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 p-5 text-xs font-medium text-slate-500">
          {getMultiLangText(language, {
            vi: 'Chưa có dữ liệu.',
            en: 'No data available.',
            ja: 'データはまだありません。',
            ko: '데이터가 없습니다.',
            zh: '暂无数据。',
            fr: 'Aucune donnée disponible.',
            de: 'Keine Daten verfügbar.',
            es: 'No hay datos disponibles.',
          })}
        </p>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-950 text-xs">{row.title}</p>
                <p className="text-[11px] font-medium text-slate-500">{row.meta}</p>
              </div>
              {row.onDelete && (
                <button onClick={row.onDelete} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">
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
};








void TextArea;
void Select;
void FilterPill;
void UserRow;
void TicketCard;
void EmptyState;

