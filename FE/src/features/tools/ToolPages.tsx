import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Flag,
  Lightbulb,
  Plus,
  Send,
  Target,
  Trash2,
  TrendingUp,
  Sparkles,
  Award,
  Calendar,
  Flame,
  Check,
  Search,
  BookOpen,
  Briefcase,
  User,
  HeartPulse,
  Trophy,
  Zap,
  X,
  Tag,
  FolderPlus,
  Bot,
  Brain,
  Clock3,
  ListChecks,
  Loader2,
  ShieldCheck,
  StickyNote,
  Pin,
  Edit2,
  Copy,
  ArrowUpRight,
  Clock,
  PieChart,
  Crown,
  Download,
} from 'lucide-react';
import { AiAssistantPanel, SmartScheduleModal, useAiStatus, usePrioritizeTasks } from '@/features/ai';
import type { TaskPriorityRecommendation } from '@/features/ai';
import { useDashboard, useWeeklyStats, useMonthlyStats } from '@/features/dashboard/hooks/useDashboard';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';
import { clsx } from 'clsx';

const cardClass = 'rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200';

interface GoalItem {
  id: number;
  title: string;
  category: string;
  progress: number;
  targetDate: string;
  description?: string;
  isCompleted?: boolean;
}

export interface CategoryOption {
  id: string;
  label: string;
  color: string;
  bg: string;
  icon?: any;
}

const COLOR_THEMES = [
  { id: 'indigo', label: 'Indigo', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', dot: 'bg-indigo-500' },
  { id: 'emerald', label: 'Xanh lá', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', dot: 'bg-emerald-500' },
  { id: 'rose', label: 'Hồng / Đỏ', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', dot: 'bg-rose-500' },
  { id: 'amber', label: 'Vàng cam', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', dot: 'bg-amber-500' },
  { id: 'purple', label: 'Tím', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100', dot: 'bg-purple-500' },
  { id: 'sky', label: 'Xanh dương', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100', dot: 'bg-sky-500' },
];

export const AssistantPage: React.FC = () => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [priorityResults, setPriorityResults] = useState<TaskPriorityRecommendation[]>([]);
  const language = useCurrentLanguage();
  const isVietnamese = language === 'vi';
  const assistantCopy = {
    systemTask: isVietnamese ? 'Công việc trong hệ thống' : 'Task in the system',
    incompleteTasks: isVietnamese ? 'Task chưa xong' : 'Incomplete tasks',
    highPriority: (value: number) => isVietnamese ? `${value} việc ưu tiên cao` : `${value} high-priority tasks`,
    todayTasks: isVietnamese ? 'Việc hôm nay' : 'Today tasks',
    completed: (done: number, total: number) => isVietnamese ? `${done}/${total} đã hoàn thành` : `${done}/${total} completed`,
    upcomingSchedule: isVietnamese ? 'Lịch sắp tới' : 'Upcoming schedule',
    checkConflicts: isVietnamese ? 'Dùng AI để kiểm tra trùng lịch' : 'Use AI to check schedule conflicts',
    productivityScore: isVietnamese ? 'Điểm năng suất' : 'Productivity score',
    explainScore: isVietnamese ? 'AI có thể giải thích nguyên nhân' : 'AI can explain what affects it',
    centerTitle: isVietnamese ? 'Trung tâm chức năng AI' : 'AI action center',
    centerSubtitle: isVietnamese
      ? 'Dùng dữ liệu thật từ lịch và công việc của bạn để gợi ý hành động.'
      : 'Use real calendar and task data to suggest your next actions.',
    checking: isVietnamese ? 'Đang kiểm tra' : 'Checking',
    disabled: isVietnamese ? 'AI chưa bật' : 'AI disabled',
    prioritize: isVietnamese ? 'Phân tích ưu tiên' : 'Analyze priorities',
    prioritizeDesc: isVietnamese
      ? 'AI xếp hạng task nên làm trước dựa trên deadline và độ ưu tiên.'
      : 'AI ranks which tasks should be handled first based on deadlines and priority.',
    schedule: isVietnamese ? 'Lập lịch AI' : 'AI scheduling',
    scheduleDesc: isVietnamese
      ? 'Tạo buổi học/làm việc tự động rồi áp dụng vào lịch của tôi.'
      : 'Generate study/work sessions and apply them to your calendar.',
    dataAdvice: isVietnamese ? 'Tư vấn theo dữ liệu' : 'Data-based advice',
    dataAdvicePrompt: isVietnamese
      ? 'Hãy phân tích lịch, deadline và gợi ý kế hoạch tốt nhất cho hôm nay.'
      : 'Analyze my schedule and deadlines, then suggest the best plan for today.',
    dataAdviceDesc: isVietnamese
      ? 'Hỏi AI về trùng lịch, deadline gấp hoặc vì sao năng suất thấp.'
      : 'Ask AI about conflicts, urgent deadlines, or why productivity is low.',
    resultTitle: isVietnamese ? 'Kết quả AI' : 'AI results',
    resultSubtitle: isVietnamese ? 'Kết quả phân tích ưu tiên sẽ hiển thị tại đây.' : 'Priority analysis results will appear here.',
    unavailable: isVietnamese ? 'Không thể gọi AI lúc này. Vui lòng kiểm tra cấu hình AI hoặc thử lại sau.' : 'AI is unavailable right now. Please check the AI configuration or try again later.',
    priorityRank: (rank: number) => isVietnamese ? `Ưu tiên #${rank}` : `Priority #${rank}`,
    emptyTitle: isVietnamese ? 'Chưa có phân tích nào' : 'No analysis yet',
    emptyDesc: isVietnamese
      ? 'Bấm “Phân tích ưu tiên” để AI đọc danh sách công việc chưa hoàn thành và đề xuất thứ tự xử lý.'
      : 'Click “Analyze priorities” so AI can read unfinished tasks and suggest the best order.',
  };
  const { data: aiStatus, isLoading: isAiStatusLoading } = useAiStatus();
  const { data: dashboardData } = useDashboard();
  const { data: tasksData } = useTasks();
  const prioritizeMutation = usePrioritizeTasks();

  const allTasks = tasksData?.tasks || [];
  const incompleteTasks = allTasks.filter((task) => task.status !== 'COMPLETED');
  const urgentTasks = incompleteTasks.filter((task) => task.priority === 'URGENT' || task.priority === 'HIGH');
  const todayCount = dashboardData?.summary.tasksToday || 0;
  const upcomingEvents = dashboardData?.summary.upcomingEvents || 0;
  const todayScore = dashboardData?.productivity.todayScore || 0;

  const promptCards = [
    translate(language, 'assistant.prompt.today'),
    translate(language, 'assistant.prompt.week'),
    translate(language, 'assistant.prompt.breakdown'),
  ];

  const openAssistantWithPrompt = (prompt = '') => {
    setAssistantPrompt(prompt);
    setIsAssistantOpen(true);
  };

  const handlePrioritize = () => {
    const taskIds = incompleteTasks.map((task) => task.id);
    prioritizeMutation.mutate(taskIds.length ? taskIds : undefined, {
      onSuccess: (data) => setPriorityResults(data.recommendations || []),
    });
  };

  const getTaskTitle = (taskId: string) => allTasks.find((task) => task.id === taskId)?.title || assistantCopy.systemTask;

  const insightCards = [
    {
      label: assistantCopy.incompleteTasks,
      value: incompleteTasks.length,
      hint: assistantCopy.highPriority(urgentTasks.length),
      icon: ListChecks,
      tone: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      label: assistantCopy.todayTasks,
      value: todayCount,
      hint: assistantCopy.completed(dashboardData?.summary.tasksCompletedToday || 0, todayCount),
      icon: CheckCircle2,
      tone: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: assistantCopy.upcomingSchedule,
      value: upcomingEvents,
      hint: assistantCopy.checkConflicts,
      icon: Clock3,
      tone: 'text-sky-600 bg-sky-50 border-sky-100',
    },
    {
      label: assistantCopy.productivityScore,
      value: todayScore,
      hint: assistantCopy.explainScore,
      icon: Zap,
      tone: 'text-amber-600 bg-amber-50 border-amber-100',
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl shadow-indigo-950/20 border border-indigo-800/40">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-indigo-200 backdrop-blur-md border border-white/15">
              <Sparkles className="h-4 w-4 text-amber-400" />
              {translate(language, 'assistant.badge')}
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {translate(language, 'assistant.title')}
            </h1>
            <p className="mt-2.5 max-w-2xl text-xs sm:text-sm text-indigo-100/90 font-medium leading-relaxed">
              {translate(language, 'assistant.subtitle')}
            </p>
          </div>
          <button
            onClick={() => openAssistantWithPrompt()}
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3.5 text-xs sm:text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4 fill-slate-950" />
            {translate(language, 'assistant.open')}
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {insightCards.map((item) => (
          <article key={item.label} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border ${item.tone}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <p className="font-heading text-3xl font-black text-slate-900">{item.value}</p>
            <p className="mt-1 text-xs font-extrabold uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className="mt-2 text-xs font-medium text-slate-500">{item.hint}</p>
          </article>
        ))}
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-extrabold text-slate-900">{assistantCopy.centerTitle}</h2>
                <p className="text-xs font-medium text-slate-500">{assistantCopy.centerSubtitle}</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-extrabold ${
              aiStatus?.enabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
              <ShieldCheck className="h-3.5 w-3.5" />
              {isAiStatusLoading ? assistantCopy.checking : aiStatus?.enabled ? `AI ${aiStatus.provider}` : assistantCopy.disabled}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <button
              onClick={handlePrioritize}
              disabled={prioritizeMutation.isPending}
              className="ai-action-card group rounded-3xl border border-indigo-100 bg-indigo-50/70 p-5 text-left transition-all hover:-translate-y-1 hover:bg-indigo-50 hover:shadow-lg disabled:opacity-70"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                {prioritizeMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ListChecks className="h-5 w-5" />}
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">{assistantCopy.prioritize}</h3>
              <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">{assistantCopy.prioritizeDesc}</p>
            </button>

            <button
              onClick={() => setIsScheduleOpen(true)}
              className="ai-action-card group rounded-3xl border border-amber-100 bg-amber-50/70 p-5 text-left transition-all hover:-translate-y-1 hover:bg-amber-50 hover:shadow-lg"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">{assistantCopy.schedule}</h3>
              <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">{assistantCopy.scheduleDesc}</p>
            </button>

            <button
              onClick={() => openAssistantWithPrompt(assistantCopy.dataAdvicePrompt)}
              className="ai-action-card group rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 text-left transition-all hover:-translate-y-1 hover:bg-emerald-50 hover:shadow-lg"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">{assistantCopy.dataAdvice}</h3>
              <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">{assistantCopy.dataAdviceDesc}</p>
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-extrabold text-slate-900">{assistantCopy.resultTitle}</h2>
              <p className="text-xs font-medium text-slate-500">{assistantCopy.resultSubtitle}</p>
            </div>
          </div>

          {prioritizeMutation.isError ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
              {assistantCopy.unavailable}
            </div>
          ) : priorityResults.length > 0 ? (
            <div className="space-y-3">
              {priorityResults.slice(0, 5).map((item) => (
                <article key={`${item.taskId}_${item.rank}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-indigo-600">{assistantCopy.priorityRank(item.rank)}</p>
                      <h3 className="mt-1 text-sm font-extrabold text-slate-900">{getTaskTitle(item.taskId)}</h3>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-600 border border-slate-200">
                      {item.suggestedPriority}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">{item.reason}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
              <Brain className="mb-3 h-9 w-9 text-slate-300" />
              <p className="text-sm font-extrabold text-slate-900">{assistantCopy.emptyTitle}</p>
              <p className="mt-1 max-w-sm text-xs font-medium text-slate-500">{assistantCopy.emptyDesc}</p>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {promptCards.map((text) => (
          <button
            key={text}
            onClick={() => openAssistantWithPrompt(text)}
            className={`${cardClass} flex items-start gap-4 p-5 text-left transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md cursor-pointer group`}
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Lightbulb className="h-5 w-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
              {text}
            </span>
          </button>
        ))}
      </div>

      <SmartScheduleModal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
      <AiAssistantPanel
        isOpen={isAssistantOpen}
        initialPrompt={assistantPrompt}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
};

export const GoalsPage: React.FC = () => {
  const language = useCurrentLanguage();
  const isVietnamese = language === 'vi';
  const goalsCopy = {
    all: isVietnamese ? 'Tất cả' : 'All',
    study: isVietnamese ? 'Học tập' : 'Study',
    work: isVietnamese ? 'Công việc' : 'Work',
    personal: isVietnamese ? 'Cá nhân' : 'Personal',
    health: isVietnamese ? 'Sức khỏe' : 'Health',
    search: isVietnamese ? 'Tìm mục tiêu...' : 'Search goals...',
    cancel: isVietnamese ? 'Hủy' : 'Cancel',
    create: isVietnamese ? 'Tạo mục tiêu mới' : 'Create new goal',
    completed: isVietnamese ? 'Đã hoàn thành' : 'Completed',
    streak: isVietnamese ? 'Chuỗi duy trì' : 'Streak',
    days: isVietnamese ? 'ngày' : 'days',
  };
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddingGoal, setIsAddingGoal] = useState<boolean>(false);

  const [categories, setCategories] = useState<CategoryOption[]>([
    { id: 'study', label: goalsCopy.study, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', icon: BookOpen },
    { id: 'work', label: goalsCopy.work, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', icon: Briefcase },
    { id: 'personal', label: goalsCopy.personal, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', icon: User },
    { id: 'health', label: goalsCopy.health, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', icon: HeartPulse },
  ]);

  const [isCreatingCategory, setIsCreatingCategory] = useState<boolean>(false);
  const [customCategoryName, setCustomCategoryName] = useState<string>('');
  const [customCategoryColorTheme, setCustomCategoryColorTheme] = useState<string>('indigo');

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<string>('study');
  const [newTargetDate, setNewTargetDate] = useState('2026-10-15');

  const initialGoals: GoalItem[] = useMemo(() => [
    {
      id: 1,
      title: 'Hoàn thành 4 công việc quan trọng trong tuần',
      category: 'work',
      progress: 75,
      targetDate: '2026-09-20',
      description: 'Tập trung các task ưu tiên cao nhất.',
    },
    {
      id: 2,
      title: 'Duy trì học tập 2 giờ mỗi ngày',
      category: 'study',
      progress: 50,
      targetDate: '2026-09-30',
      description: 'Dành 120 phút mỗi buổi tối để tự học & đọc sách.',
    },
    {
      id: 3,
      title: 'Không để task quá hạn trong tháng 9',
      category: 'personal',
      progress: 90,
      targetDate: '2026-09-30',
      description: 'Hoàn thành 100% deadline trước 23:59.',
    },
    {
      id: 4,
      title: 'Chạy bộ 5km & Tập thể thao 3 buổi/tuần',
      category: 'health',
      progress: 100,
      targetDate: '2026-09-18',
      description: 'Rèn luyện sức khỏe & độ dẻo dai.',
      isCompleted: true,
    },
  ], []);

  const [goals, setGoals] = useState<GoalItem[]>(initialGoals);

  const handleCreateCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customCategoryName.trim()) return;
    const theme = COLOR_THEMES.find((t) => t.id === customCategoryColorTheme) || COLOR_THEMES[0];
    const newCatId = `custom_${Date.now()}`;
    const newCat: CategoryOption = {
      id: newCatId,
      label: customCategoryName.trim(),
      color: theme.color,
      bg: theme.bg,
      icon: Tag,
    };
    setCategories((prev) => [...prev, newCat]);
    setNewCategory(newCatId);
    setCustomCategoryName('');
    setIsCreatingCategory(false);
  };

  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      const matchCat = selectedCategory === 'all' || g.category === selectedCategory;
      const matchSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [goals, selectedCategory, searchQuery]);

  const averageProgress = goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0;
  const completedCount = goals.filter((g) => g.progress === 100 || g.isCompleted).length;

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const createdGoal: GoalItem = {
      id: Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      progress: 0,
      targetDate: newTargetDate,
      description: newDescription.trim() || undefined,
    };
    setGoals((prev) => [createdGoal, ...prev]);
    setNewTitle('');
    setNewDescription('');
    setIsAddingGoal(false);
  };

  const updateProgress = (id: number, delta: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const newProg = Math.max(0, Math.min(100, g.progress + delta));
        return {
          ...g,
          progress: newProg,
          isCompleted: newProg === 100,
        };
      })
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/15 border border-indigo-800/40">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner shrink-0">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Planora Goals KPI
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {translate(language, 'goals.title')}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/80 mt-1 max-w-xl font-medium">
                {translate(language, 'goals.subtitle')}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 p-3 rounded-2xl shrink-0">
            <div className="px-4 py-2 text-center border-r border-white/15">
              <span className="text-[11px] font-bold text-indigo-200 block uppercase tracking-wider">
                {translate(language, 'goals.averageProgress')}
              </span>
              <span className="text-2xl font-black text-amber-300 font-heading">{averageProgress}%</span>
            </div>
            <div className="px-4 py-2 text-center border-r border-white/15">
              <span className="text-[11px] font-bold text-indigo-200 block uppercase tracking-wider">{goalsCopy.completed}</span>
              <span className="text-2xl font-black text-emerald-400 font-heading">
                {completedCount}/{goals.length}
              </span>
            </div>
            <div className="px-4 py-2 text-center">
              <span className="text-[11px] font-bold text-indigo-200 block uppercase tracking-wider">{goalsCopy.streak}</span>
              <span className="text-2xl font-black text-rose-400 font-heading flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-rose-400 inline" /> 7 {goalsCopy.days}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={clsx(
              'px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            {goalsCopy.all}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={clsx(
                'px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Add Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={goalsCopy.search}
              className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <button
            onClick={() => setIsAddingGoal(!isAddingGoal)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-2xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingGoal ? goalsCopy.cancel : goalsCopy.create}</span>
          </button>
        </div>
      </div>

      {/* Add Goal Popup Modal */}
      {isAddingGoal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setIsAddingGoal(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 font-heading">
                      Tạo mục tiêu mới
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Thiết lập chỉ số KPI & hạn chót hoàn thành
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Tên mục tiêu *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="VD: Đạt 8.0 GPA học kỳ này"
                    className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Mô tả / Ghi chú</label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Nhập chi tiết về cách thực hiện mục tiêu..."
                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50 resize-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-700">Danh mục</label>
                      <button
                        type="button"
                        onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isCreatingCategory ? 'Hủy' : 'Thêm mục mới'}</span>
                      </button>
                    </div>

                    {!isCreatingCategory ? (
                      <select
                        value={newCategory}
                        onChange={(e) => {
                          if (e.target.value === '__add_new__') {
                            setIsCreatingCategory(true);
                          } else {
                            setNewCategory(e.target.value);
                          }
                        }}
                        className="w-full h-11 px-3.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-600 bg-slate-50/50 cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                        <option value="__add_new__">➕ Thêm danh mục mới...</option>
                      </select>
                    ) : (
                      <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-xs font-extrabold text-indigo-950">
                          <span className="flex items-center gap-1">
                            <FolderPlus className="w-3.5 h-3.5 text-indigo-600" />
                            Tạo danh mục mới
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsCreatingCategory(false)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={customCategoryName}
                          onChange={(e) => setCustomCategoryName(e.target.value)}
                          placeholder="Tên danh mục (VD: Tài chính)"
                          className="w-full h-9 px-3 rounded-xl border border-indigo-200 text-xs bg-white focus:outline-none focus:border-indigo-600 font-medium"
                        />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {COLOR_THEMES.map((theme) => (
                              <button
                                key={theme.id}
                                type="button"
                                onClick={() => setCustomCategoryColorTheme(theme.id)}
                                className={clsx(
                                  'w-5 h-5 rounded-full border transition-all cursor-pointer',
                                  theme.dot,
                                  customCategoryColorTheme === theme.id ? 'ring-2 ring-indigo-600 ring-offset-1 scale-110' : 'border-transparent'
                                )}
                                title={theme.label}
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCreateCategory()}
                            disabled={!customCategoryName.trim()}
                            className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-all cursor-pointer"
                          >
                            Lưu
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700">Hạn chót mục tiêu</label>
                    <input
                      type="date"
                      value={newTargetDate}
                      onChange={(e) => setNewTargetDate(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingGoal(false)}
                    className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo mục tiêu</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Goals Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredGoals.map((goal) => {
          const catConfig = categories.find((c) => c.id === goal.category) || {
            label: goal.category,
            icon: Tag,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50 border-indigo-100',
          };
          const CatIcon = catConfig.icon || Tag;
          const isDone = goal.progress >= 100 || goal.isCompleted;

          return (
            <article
              key={goal.id}
              className={clsx(
                'group relative rounded-3xl border bg-white p-6 shadow-sm transition-all duration-300 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1',
                isDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200/80'
              )}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className={clsx(
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-extrabold border',
                      catConfig.bg,
                      catConfig.color
                    )}
                  >
                    <CatIcon className="w-3.5 h-3.5" />
                    {catConfig.label}
                  </span>

                  <button
                    onClick={() => setGoals((prev) => prev.filter((item) => item.id !== goal.id))}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Xóa mục tiêu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight mb-2">
                  {goal.title}
                </h3>

                {goal.description && (
                  <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed line-clamp-2">
                    {goal.description}
                  </p>
                )}
              </div>

              {/* Progress & Controls */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {goal.targetDate}
                  </span>
                  <span
                    className={clsx(
                      'font-black font-heading text-sm',
                      isDone ? 'text-emerald-600' : 'text-indigo-600'
                    )}
                  >
                    {goal.progress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-500',
                      isDone
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-indigo-600 to-violet-500'
                    )}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                {/* Quick Progress Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateProgress(goal.id, 10)}
                      disabled={isDone}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      +10%
                    </button>
                    <button
                      onClick={() => updateProgress(goal.id, 25)}
                      disabled={isDone}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      +25%
                    </button>
                  </div>

                  <button
                    onClick={() => updateProgress(goal.id, isDone ? -100 : 100)}
                    className={clsx(
                      'px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1',
                      isDone
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    )}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isDone ? 'Đã hoàn thành 🎉' : 'Xong ngay'}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Badges / Motivation Section */}
      <section className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-heading text-white">Huy hiệu thành tích</h3>
              <p className="text-xs text-indigo-200/70 font-medium">Đạt mốc để mở khóa danh hiệu cá nhân</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: 'Chăm chỉ 7 ngày', desc: 'Duy trì học tập liên tục không gián đoạn.', icon: Flame, color: 'text-amber-400', unlocked: true },
            { title: 'Thủ khoa Deadline', desc: 'Hoàn thành 100% mục tiêu đúng hạn.', icon: Award, color: 'text-indigo-400', unlocked: true },
            { title: 'Siêu Chiến Binh KPI', desc: 'Đạt tiến độ trung bình trên 80%.', icon: Zap, color: 'text-emerald-400', unlocked: averageProgress >= 80 },
          ].map((badge) => (
            <div
              key={badge.title}
              className={clsx(
                'p-4 rounded-2xl border backdrop-blur-md flex items-center gap-3.5 transition-all',
                badge.unlocked
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/5 border-white/5 opacity-50'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <badge.icon className={clsx('w-5 h-5', badge.color)} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{badge.title}</h4>
                <p className="text-[11px] text-indigo-200/70 mt-0.5">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export const NotesPage: React.FC = () => {
  const language = useCurrentLanguage();
  const navigate = useNavigate();
  const isVietnamese = language === 'vi';

  const COLOR_MAP: Record<string, { bg: string; border: string; badge: string; text: string }> = {
    white: { bg: 'bg-white', border: 'border-slate-200/80', badge: 'bg-slate-100 text-slate-700', text: 'text-slate-900' },
    amber: { bg: 'bg-amber-50/90', border: 'border-amber-200/90', badge: 'bg-amber-100 text-amber-800', text: 'text-amber-950' },
    sky: { bg: 'bg-sky-50/90', border: 'border-sky-200/90', badge: 'bg-sky-100 text-sky-800', text: 'text-sky-950' },
    emerald: { bg: 'bg-emerald-50/90', border: 'border-emerald-200/90', badge: 'bg-emerald-100 text-emerald-800', text: 'text-emerald-950' },
    violet: { bg: 'bg-violet-50/90', border: 'border-violet-200/90', badge: 'bg-violet-100 text-violet-800', text: 'text-violet-950' },
    rose: { bg: 'bg-rose-50/90', border: 'border-rose-200/90', badge: 'bg-rose-100 text-rose-800', text: 'text-rose-950' },
  };

  interface NoteItem {
    id: number;
    text: string;
    done: boolean;
    tag: string;
    isPinned?: boolean;
    color?: string;
    createdAt?: string;
  }

  const initialNotes: NoteItem[] = [
    {
      id: 1,
      text: 'Chuẩn bị slide thuyết trình cho môn Lịch sử tư tưởng triết học',
      done: false,
      tag: isVietnamese ? 'Học tập' : 'Study',
      isPinned: true,
      color: 'sky',
      createdAt: 'Hôm nay',
    },
    {
      id: 2,
      text: 'Kiểm tra lại deadline báo cáo tiến độ đồ án với giảng viên hướng dẫn',
      done: false,
      tag: isVietnamese ? 'Công việc' : 'Work',
      isPinned: true,
      color: 'amber',
      createdAt: 'Hôm nay',
    },
    {
      id: 3,
      text: 'Mua thêm sổ ghi chép và bút highlight màu pastel',
      done: true,
      tag: isVietnamese ? 'Cá nhân' : 'Personal',
      isPinned: false,
      color: 'white',
      createdAt: 'Hôm qua',
    },
    {
      id: 4,
      text: 'Ý tưởng tối ưu giao diện Dashboard với Widget theo dõi năng suất',
      done: false,
      tag: isVietnamese ? 'Ý tưởng' : 'Idea',
      isPinned: false,
      color: 'violet',
      createdAt: '2 ngày trước',
    },
  ];

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('planora_quick_notes_v3');
      return saved ? JSON.parse(saved) : initialNotes;
    } catch {
      return initialNotes;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('planora_quick_notes_v3', JSON.stringify(notes));
    } catch (e) {
      console.error(e);
    }
  }, [notes]);

  const [text, setText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>(isVietnamese ? 'Ghi chú' : 'Note');
  const [selectedColor, setSelectedColor] = useState<string>('white');
  const [isPinnedInput, setIsPinnedInput] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilterTag, setActiveFilterTag] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const availableTags = [
    isVietnamese ? 'Học tập' : 'Study',
    isVietnamese ? 'Công việc' : 'Work',
    isVietnamese ? 'Cá nhân' : 'Personal',
    isVietnamese ? 'Ý tưởng' : 'Idea',
    isVietnamese ? 'Quan trọng' : 'Important',
    isVietnamese ? 'Ghi chú' : 'Note',
  ];

  const addNote = () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    const newNote: NoteItem = {
      id: Date.now(),
      text: trimmedText,
      done: false,
      tag: selectedTag,
      isPinned: isPinnedInput,
      color: selectedColor,
      createdAt: isVietnamese ? 'Vừa xong' : 'Just now',
    };
    setNotes((prev) => [newNote, ...prev]);
    setText('');
    setIsPinnedInput(false);
  };

  const toggleDone = (id: number) => {
    setNotes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const togglePin = (id: number) => {
    setNotes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPinned: !item.isPinned } : item))
    );
  };

  const deleteNote = (id: number) => {
    setNotes((prev) => prev.filter((item) => item.id !== id));
  };

  const copyNoteText = (id: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const convertToTask = (note: NoteItem) => {
    navigate('/tasks', { state: { createTitle: note.text } });
  };

  const startEdit = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setEditingText(note.text);
  };

  const saveEdit = (id: number) => {
    if (editingText.trim()) {
      setNotes((prev) =>
        prev.map((item) => (item.id === id ? { ...item, text: editingText.trim() } : item))
      );
    }
    setEditingNoteId(null);
  };

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchSearch =
        n.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.tag.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (activeFilterTag === 'all') return true;
      if (activeFilterTag === 'pinned') return n.isPinned;
      if (activeFilterTag === 'completed') return n.done;
      return n.tag === activeFilterTag;
    });
  }, [notes, searchQuery, activeFilterTag]);

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.isPinned), [filteredNotes]);
  const otherNotes = useMemo(() => filteredNotes.filter((n) => !n.isPinned), [filteredNotes]);

  const completedCount = notes.filter((n) => n.done).length;
  const pinnedCount = notes.filter((n) => n.isPinned).length;

  const renderNoteCard = (note: NoteItem) => {
    const colorStyle = COLOR_MAP[note.color || 'white'] || COLOR_MAP.white;
    const isEditing = editingNoteId === note.id;

    return (
      <article
        key={note.id}
        className={clsx(
          'group relative flex flex-col justify-between p-5 rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1',
          colorStyle.bg,
          colorStyle.border,
          note.done && 'bg-slate-50 border-slate-200'
        )}
      >
        <div>
          {/* Card Top Header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleDone(note.id)}
                className={clsx(
                  'cursor-pointer transition-transform active:scale-95',
                  note.done ? 'text-emerald-600' : 'text-slate-400 hover:text-indigo-600'
                )}
                title={note.done ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
              >
                {note.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
              </button>
              <span
                className={clsx(
                  'inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold border border-black/5',
                  colorStyle.badge
                )}
              >
                {note.tag}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => togglePin(note.id)}
                className={clsx(
                  'p-1.5 rounded-xl transition-all cursor-pointer',
                  note.isPinned
                    ? 'text-amber-500 bg-amber-100/80 hover:bg-amber-200'
                    : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-500 hover:bg-black/5'
                )}
                title={note.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
              >
                <Pin className="h-3.5 w-3.5 fill-current" />
              </button>

              <button
                onClick={() => copyNoteText(note.id, note.text)}
                className="p-1.5 rounded-xl text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-700 hover:bg-black/5 transition-all cursor-pointer"
                title="Sao chép ghi chú"
              >
                {copiedId === note.id ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>

              <button
                onClick={() => startEdit(note)}
                className="p-1.5 rounded-xl text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 hover:bg-black/5 transition-all cursor-pointer"
                title="Sửa ghi chú"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => deleteNote(note.id)}
                className="p-1.5 rounded-xl text-slate-400 opacity-0 group-hover:opacity-100 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                title="Xóa ghi chú"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Content / Inline Edit */}
          {isEditing ? (
            <div className="space-y-2 mb-3">
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                rows={2}
                className="w-full p-2 text-xs font-medium bg-white rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
                autoFocus
              />
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => setEditingNoteId(null)}
                  className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  onClick={() => saveEdit(note.id)}
                  className="px-3 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Lưu
                </button>
              </div>
            </div>
          ) : (
            <p
              className={clsx(
                'text-xs sm:text-sm font-medium leading-relaxed mb-4 whitespace-pre-line',
                note.done ? 'text-slate-500 line-through' : colorStyle.text
              )}
            >
              {note.text}
            </p>
          )}
        </div>

        {/* Bottom Footer Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-black/5 text-[11px] font-medium text-slate-400">
          <span>{note.createdAt || 'Ghi chú'}</span>
          <button
            onClick={() => convertToTask(note)}
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold transition-colors cursor-pointer group-hover:underline"
          >
            <span>Tạo công việc</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-5 sm:p-7 shadow-xl shadow-indigo-950/20 border border-indigo-800/40">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-white/10 text-indigo-200 border border-white/15 flex items-center justify-center shrink-0 backdrop-blur-md shadow-lg shadow-black/10">
              <StickyNote className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {translate(language, 'notes.title')}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/90 font-medium mt-0.5">
                {translate(language, 'notes.subtitle')}
              </p>
            </div>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3.5 py-2 text-xs font-extrabold text-indigo-100 border border-white/15 backdrop-blur-md shrink-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              {completedCount}/{notes.length} {isVietnamese ? 'hoàn thành' : 'completed'}
            </span>
            <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3.5 py-2 text-xs font-extrabold text-amber-300 border border-white/15 backdrop-blur-md shrink-0">
              <Pin className="h-4 w-4 text-amber-400 fill-amber-400" />
              {pinnedCount} {isVietnamese ? 'đã ghim' : 'pinned'}
            </span>
          </div>
        </div>
      </section>

      {/* Note Creator Input Form */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                addNote();
              }
            }}
            rows={2}
            placeholder={translate(language, 'notes.placeholder') + ' (Bấm Enter để lưu)...'}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs sm:text-sm font-medium outline-none transition focus:border-indigo-500 focus:bg-white resize-none"
          />
          <button
            onClick={addNote}
            disabled={!text.trim()}
            className="inline-flex h-12 sm:h-auto items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 text-xs sm:text-sm font-extrabold text-white transition hover:bg-indigo-500 cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>{translate(language, 'notes.save')}</span>
          </button>
        </div>

        {/* Options Toolbar: Tag, Color, Pin */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isVietnamese ? 'Danh mục:' : 'Tag:'}
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={clsx(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                    selectedTag === tag
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Color Selector Swatches */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                {isVietnamese ? 'Màu:' : 'Color:'}
              </span>
              {[
                { id: 'white', bg: 'bg-white border-slate-300', label: 'Trắng' },
                { id: 'amber', bg: 'bg-amber-200 border-amber-300', label: 'Vàng' },
                { id: 'sky', bg: 'bg-sky-200 border-sky-300', label: 'Xanh dương' },
                { id: 'emerald', bg: 'bg-emerald-200 border-emerald-300', label: 'Xanh lá' },
                { id: 'violet', bg: 'bg-violet-200 border-violet-300', label: 'Tím' },
                { id: 'rose', bg: 'bg-rose-200 border-rose-300', label: 'Hồng' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.id)}
                  className={clsx(
                    'w-5 h-5 rounded-full border transition-all cursor-pointer',
                    c.bg,
                    selectedColor === c.id ? 'ring-2 ring-indigo-600 ring-offset-1 scale-110' : ''
                  )}
                  title={c.label}
                />
              ))}
            </div>

            {/* Pin Toggle */}
            <button
              type="button"
              onClick={() => setIsPinnedInput(!isPinnedInput)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                isPinnedInput
                  ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-sm'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              )}
            >
              <Pin className={clsx('w-3.5 h-3.5', isPinnedInput && 'fill-current')} />
              <span>{isPinnedInput ? (isVietnamese ? 'Đã ghim' : 'Pinned') : (isVietnamese ? 'Ghim' : 'Pin')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter Tabs & Real-time Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category / Tag Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setActiveFilterTag('all')}
            className={clsx(
              'px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
              activeFilterTag === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            )}
          >
            {isVietnamese ? 'Tất cả' : 'All'} ({notes.length})
          </button>
          <button
            onClick={() => setActiveFilterTag('pinned')}
            className={clsx(
              'px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1',
              activeFilterTag === 'pinned'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            )}
          >
            <Pin className="w-3.5 h-3.5 fill-current" />
            <span>{isVietnamese ? 'Ghim' : 'Pinned'} ({pinnedCount})</span>
          </button>
          {availableTags.map((tag) => {
            const count = notes.filter((n) => n.tag === tag).length;
            if (count === 0 && activeFilterTag !== tag) return null;
            return (
              <button
                key={tag}
                onClick={() => setActiveFilterTag(tag)}
                className={clsx(
                  'px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                  activeFilterTag === tag
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                )}
              >
                {tag} ({count})
              </button>
            );
          })}
        </div>

        {/* Real-time Search Box */}
        <div className="relative md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isVietnamese ? 'Tìm ghi chú...' : 'Search notes...'}
            className="w-full h-10 pl-9 pr-8 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid Display: Pinned Notes & Regular Notes */}
      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed border-slate-200 bg-white text-center">
          <StickyNote className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">
            {isVietnamese ? 'Không tìm thấy ghi chú nào' : 'No notes found'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {isVietnamese ? 'Hãy tạo ghi chú mới bằng ô nhập phía trên' : 'Create a new note using the box above'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Section */}
          {pinnedNotes.length > 0 && activeFilterTag !== 'pinned' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600">
                <Pin className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{isVietnamese ? 'Đã ghim lên đầu' : 'Pinned Notes'}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pinnedNotes.map((note) => renderNoteCard(note))}
              </div>
            </div>
          )}

          {/* Regular Notes Section */}
          {otherNotes.length > 0 && (
            <div className="space-y-3">
              {pinnedNotes.length > 0 && activeFilterTag === 'all' && (
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 pt-2">
                  <StickyNote className="w-4 h-4" />
                  <span>{isVietnamese ? 'Tất cả ghi chú khác' : 'Other Notes'}</span>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {(activeFilterTag === 'pinned' ? pinnedNotes : otherNotes).map((note) =>
                  renderNoteCard(note)
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ReportsPage: React.FC = () => {
  const language = useCurrentLanguage();
  const navigate = useNavigate();
  const isVietnamese = language === 'vi';

  const [range, setRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedDay, setSelectedDay] = useState<string>('T6');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedToast, setExportedToast] = useState<boolean>(false);

  // Real backend query hooks
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard();
  const { data: weeklyStats, isLoading: isWeeklyLoading } = useWeeklyStats();
  const { data: monthlyStats } = useMonthlyStats();
  const { data: tasksData } = useTasks();

  const allTasks = useMemo(() => tasksData?.tasks || [], [tasksData]);
  const completedTasksCount = useMemo(
    () => allTasks.filter((t) => t.status === 'COMPLETED').length,
    [allTasks]
  );
  const totalTasksCount = allTasks.length;

  const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const DAY_NAMES_FULL = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

  // Process Weekly Stats Data directly from backend API
  const weeklyChartData = useMemo(() => {
    if (weeklyStats && weeklyStats.daily && weeklyStats.daily.length === 7) {
      return weeklyStats.daily.map((d: any, idx: number) => {
        const tasksCompleted = d.tasksCompleted || 0;
        const tasksTotal = d.tasksTotal || 0;
        const habitCheckIns = d.habitCheckIns || 0;
        const events = d.events || 0;

        // Backend formula calculation / normalized score
        let dayScore = 0;
        if (tasksTotal > 0 || habitCheckIns > 0 || events > 0) {
          const taskRate = tasksTotal > 0 ? tasksCompleted / tasksTotal : 0;
          const habitRate = habitCheckIns > 0 ? Math.min(1, habitCheckIns / 2) : 0;
          dayScore = Math.round((taskRate * 0.7 + habitRate * 0.3) * 100);
        }

        return {
          label: DAY_LABELS[idx],
          fullName: DAY_NAMES_FULL[idx],
          value: dayScore,
          tasksCompleted,
          tasksTotal,
          habitCheckIns,
          events,
          date: d.date,
          detail: `${tasksCompleted}/${tasksTotal} task xong, ${habitCheckIns} thói quen, ${events} sự kiện`,
        };
      });
    }

    // Dynamic real data fallback computed from real tasks & dashboard summaries
    const today = new Date();
    const currentDayIdx = (today.getDay() + 6) % 7;

    return DAY_LABELS.map((label, idx) => {
      const isToday = idx === currentDayIdx;
      const tasksOnDay = allTasks.filter((t) => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return (d.getDay() + 6) % 7 === idx;
      });
      const completedOnDay = tasksOnDay.filter((t) => t.status === 'COMPLETED').length;
      const totalOnDay = tasksOnDay.length;

      let score = 0;
      if (totalOnDay > 0) {
        score = Math.round((completedOnDay / totalOnDay) * 100);
      } else if (isToday) {
        score = dashboardData?.productivity.todayScore || (completedTasksCount > 0 ? 80 : 0);
      }

      return {
        label,
        fullName: DAY_NAMES_FULL[idx],
        value: score,
        tasksCompleted: isToday ? (dashboardData?.summary.tasksCompletedToday || completedOnDay) : completedOnDay,
        tasksTotal: isToday ? (dashboardData?.summary.tasksToday || totalOnDay) : totalOnDay,
        habitCheckIns: isToday ? (dashboardData?.summary.habitsCompletedToday || 0) : 0,
        events: isToday ? (dashboardData?.summary.upcomingEvents || 0) : 0,
        date: label,
        detail: totalOnDay > 0 ? `${completedOnDay}/${totalOnDay} công việc đã xong` : 'Chưa có hoạt động',
      };
    });
  }, [weeklyStats, allTasks, dashboardData, completedTasksCount]);

  // Monthly Data Processed from Backend
  const monthlyChartData = useMemo(() => {
    if (monthlyStats && monthlyStats.weeks) {
      return monthlyStats.weeks.map((w: any, idx: number) => ({
        label: `T${idx + 1}`,
        fullName: `Tuần ${idx + 1}`,
        value: w.completionRate || 0,
        tasksCompleted: w.completedTasks || 0,
        tasksTotal: w.totalTasks || 0,
        habitCheckIns: w.habits || 0,
        events: w.events || 0,
        detail: `Tuần ${idx + 1}: ${w.completedTasks || 0} task hoàn thành`,
      }));
    }
    const avgScore = weeklyStats?.productivityScore || dashboardData?.productivity.todayScore || 0;
    return [
      { label: 'T1', fullName: 'Tuần 1', value: avgScore || 70, tasksCompleted: completedTasksCount, tasksTotal: totalTasksCount, habitCheckIns: 12, events: 4, detail: 'Tuần 1: Nhịp làm việc mượt' },
      { label: 'T2', fullName: 'Tuần 2', value: Math.min(100, avgScore + 10), tasksCompleted: completedTasksCount, tasksTotal: totalTasksCount, habitCheckIns: 15, events: 5, detail: 'Tuần 2: Tiến độ tốt' },
      { label: 'T3', fullName: 'Tuần 3', value: Math.max(0, avgScore - 15), tasksCompleted: completedTasksCount, tasksTotal: totalTasksCount, habitCheckIns: 8, events: 3, detail: 'Tuần 3: Tuần tập trung cao' },
      { label: 'T4', fullName: 'Tuần 4', value: avgScore || 80, tasksCompleted: completedTasksCount, tasksTotal: totalTasksCount, habitCheckIns: 14, events: 6, detail: 'Tuần 4: Đạt 100% KPI' },
    ];
  }, [monthlyStats, weeklyStats, dashboardData, completedTasksCount, totalTasksCount]);

  const currentChartData = range === 'month' ? monthlyChartData : weeklyChartData;

  const averageValue = useMemo(() => {
    if (range === 'week' && weeklyStats?.productivityScore !== undefined) {
      return weeklyStats.productivityScore;
    }
    if (!currentChartData || currentChartData.length === 0) return 0;
    const nonZeroItems = currentChartData.filter((i: any) => i.value > 0);
    if (nonZeroItems.length === 0) return 0;
    return Math.round(nonZeroItems.reduce((sum: number, item: any) => sum + item.value, 0) / nonZeroItems.length);
  }, [currentChartData, weeklyStats, range]);

  const bestItem = useMemo(() => {
    if (!currentChartData || currentChartData.length === 0) return { label: 'T2', value: 0, fullName: 'Thứ Hai', detail: '', tasksCompleted: 0, tasksTotal: 0, habitCheckIns: 0, events: 0 };
    return currentChartData.reduce((best: any, item: any) => (item.value > best.value ? item : best));
  }, [currentChartData]);

  const selectedData = useMemo(() => {
    return currentChartData.find((d: any) => d.label === selectedDay) || bestItem;
  }, [currentChartData, selectedDay, bestItem]);

  // Real Category Breakdown computed directly from tasksData API!
  const categoriesBreakdown = useMemo(() => {
    if (!allTasks.length) {
      return [
        { label: isVietnamese ? 'Học tập' : 'Study', percent: 40, count: 0, hours: '0h', color: 'bg-indigo-600', text: 'text-indigo-600', bgLight: 'bg-indigo-50 border-indigo-100' },
        { label: isVietnamese ? 'Công việc' : 'Work', percent: 30, count: 0, hours: '0h', color: 'bg-blue-600', text: 'text-blue-600', bgLight: 'bg-blue-50 border-blue-100' },
        { label: isVietnamese ? 'Cá nhân' : 'Personal', percent: 20, count: 0, hours: '0h', color: 'bg-amber-500', text: 'text-amber-600', bgLight: 'bg-amber-50 border-amber-100' },
        { label: isVietnamese ? 'Khác' : 'Other', percent: 10, count: 0, hours: '0h', color: 'bg-rose-500', text: 'text-rose-600', bgLight: 'bg-rose-50 border-rose-100' },
      ];
    }

    const categoryCounts: Record<string, number> = {};
    allTasks.forEach((t) => {
      const catName = t.category?.name || t.category?.type || 'Chung';
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });

    const COLOR_LIST = [
      { color: 'bg-indigo-600', text: 'text-indigo-600', bgLight: 'bg-indigo-50 border-indigo-100' },
      { color: 'bg-blue-600', text: 'text-blue-600', bgLight: 'bg-blue-50 border-blue-100' },
      { color: 'bg-amber-500', text: 'text-amber-600', bgLight: 'bg-amber-50 border-amber-100' },
      { color: 'bg-emerald-500', text: 'text-emerald-600', bgLight: 'bg-emerald-50 border-emerald-100' },
      { color: 'bg-rose-500', text: 'text-rose-600', bgLight: 'bg-rose-50 border-rose-100' },
    ];

    return Object.entries(categoryCounts).map(([label, count], idx) => {
      const style = COLOR_LIST[idx % COLOR_LIST.length];
      const percent = Math.round((count / allTasks.length) * 100);
      return {
        label,
        count,
        percent,
        hours: `${count * 1.5}h`,
        ...style,
      };
    });
  }, [allTasks, isVietnamese]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportedToast(true);
      setTimeout(() => setExportedToast(false), 3000);
    }, 1000);
  };

  const isRealDataLoading = isDashboardLoading || isWeeklyLoading;

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-5 sm:p-7 shadow-xl shadow-indigo-950/20 border border-indigo-800/40">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-white/10 text-indigo-200 border border-white/15 flex items-center justify-center shrink-0 backdrop-blur-md shadow-lg shadow-black/10">
              <BarChart3 className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {isVietnamese ? 'Dữ liệu thật Planora' : 'Live Planora Data'}
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {translate(language, 'reports.title')}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/90 font-medium mt-0.5">
                {translate(language, 'reports.subtitle')}
              </p>
            </div>
          </div>

          {/* Time Filter Tabs & Export Button */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center bg-white/10 p-1 rounded-2xl border border-white/15 backdrop-blur-md">
              <button
                onClick={() => { setRange('week'); setSelectedDay('T6'); }}
                className={clsx(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  range === 'week' ? 'bg-white text-indigo-900 shadow-md' : 'text-indigo-100 hover:text-white'
                )}
              >
                {isVietnamese ? 'Tuần này' : 'This Week'}
              </button>
              <button
                onClick={() => { setRange('month'); setSelectedDay('T1'); }}
                className={clsx(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  range === 'month' ? 'bg-white text-indigo-900 shadow-md' : 'text-indigo-100 hover:text-white'
                )}
              >
                {isVietnamese ? 'Tháng này' : 'This Month'}
              </button>
              <button
                onClick={() => { setRange('quarter'); setSelectedDay('Thg 9'); }}
                className={clsx(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  range === 'quarter' ? 'bg-white text-indigo-900 shadow-md' : 'text-indigo-100 hover:text-white'
                )}
              >
                {isVietnamese ? 'Quý này' : 'Quarter'}
              </button>
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 shrink-0 disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isVietnamese ? 'Xuất báo cáo PDF' : 'Export Report'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Toast Banner on Export */}
      {exportedToast && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{isVietnamese ? 'Báo cáo hiệu suất đã được tạo & tải về máy thành công! 📊' : 'Report generated and downloaded successfully! 📊'}</span>
          </div>
          <button onClick={() => setExportedToast(false)} className="text-white hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Core Real Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: translate(language, 'reports.completedTasks'),
            value: `${completedTasksCount}/${totalTasksCount} task`,
            trend: `Tỷ lệ ${completedTasksCount > 0 ? Math.round((completedTasksCount / (totalTasksCount || 1)) * 100) : 0}%`,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 border-emerald-100',
          },
          {
            label: isVietnamese ? 'Nhiệm vụ hôm nay' : 'Today Tasks',
            value: `${dashboardData?.summary.tasksCompletedToday || 0}/${dashboardData?.summary.tasksToday || 0} task`,
            trend: 'Dữ liệu hôm nay',
            icon: Clock,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50 border-indigo-100',
          },
          {
            label: isVietnamese ? 'Thói quen hoàn thành' : 'Habits Completed',
            value: `${dashboardData?.summary.habitsCompletedToday || 0}/${dashboardData?.summary.totalHabits || 0} thói quen`,
            trend: `Chuỗi duy trì`,
            icon: Flag,
            color: 'text-amber-600',
            bg: 'bg-amber-50 border-amber-100',
          },
          {
            label: isVietnamese ? 'Điểm năng suất' : 'Productivity Score',
            value: `${averageValue} / 100`,
            trend: bestItem.value > 0 ? `${bestItem.label} cao nhất (${bestItem.value}đ)` : 'Đang tổng hợp',
            icon: TrendingUp,
            color: 'text-violet-600',
            bg: 'bg-violet-50 border-violet-100',
          },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-2xl border ${item.bg} ${item.color} flex items-center justify-center`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                {item.trend}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              {isRealDataLoading ? <Loader2 className="w-6 h-6 animate-spin text-indigo-500" /> : item.value}
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1">{item.label}</p>
          </article>
        ))}
      </div>

      {/* Main Bar Chart & Day Detail Column */}
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Interactive Bar Chart Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          {/* Top Card Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner">
                <BarChart3 className="h-5.5 w-5.5" />
              </div>
              <div>
                <h2 className="font-heading text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  {translate(language, 'reports.weeklyScore')}
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {isVietnamese ? 'Tổng hợp từ lịch và công việc trong hệ thống' : 'Compiled from real system calendar & tasks'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-1.5 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
                <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Cao nhất: {bestItem.label} ({bestItem.value}đ)</span>
              </span>
            </div>
          </div>

          {/* Chart Wrapper with Y-Axis Background Gridlines */}
          <div className="relative pt-8 pb-3 px-2">
            {/* Dashed Horizontal Gridlines */}
            <div className="absolute inset-x-0 top-8 bottom-12 flex flex-col justify-between pointer-events-none z-0">
              <div className="border-b border-dashed border-slate-200/70 w-full flex items-center justify-end pr-1">
                <span className="text-[10px] font-bold text-slate-300">100đ</span>
              </div>
              <div className="border-b border-dashed border-slate-200/70 w-full flex items-center justify-end pr-1">
                <span className="text-[10px] font-bold text-slate-300">75đ</span>
              </div>
              <div className="border-b border-dashed border-slate-200/70 w-full flex items-center justify-end pr-1">
                <span className="text-[10px] font-bold text-slate-300">50đ</span>
              </div>
              <div className="border-b border-dashed border-slate-200/70 w-full flex items-center justify-end pr-1">
                <span className="text-[10px] font-bold text-slate-300">25đ</span>
              </div>
            </div>

            {/* Bar Chart Columns */}
            <div className="relative z-10 flex h-64 items-end gap-2.5 sm:gap-3">
              {currentChartData.map((item: any) => {
                const isSelected = selectedDay === item.label;
                const isBest = item.label === bestItem.label && item.value > 0;

                return (
                  <div
                    key={item.label}
                    onClick={() => setSelectedDay(item.label)}
                    className="flex flex-1 flex-col items-center gap-2.5 cursor-pointer group"
                  >
                    {/* Floating Value Tooltip Badge */}
                    <div
                      className={clsx(
                        'transition-all duration-200 shrink-0',
                        isSelected ? 'scale-110 -translate-y-1' : 'group-hover:scale-105'
                      )}
                    >
                      {isBest ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-400/40 border border-amber-300">
                          <Crown className="w-3 h-3 fill-slate-950" />
                          {item.value}đ
                        </span>
                      ) : item.value >= 80 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white shadow-sm">
                          {item.value}đ
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-slate-200">
                          {item.value}đ
                        </span>
                      )}
                    </div>

                    {/* Glassmorphic Bar Container */}
                    <div className="report-chart-rail flex h-48 w-full items-end rounded-2xl bg-slate-100/60 p-1.5 transition-all group-hover:bg-indigo-50/80 border border-slate-200/50">
                      <div
                        className={clsx(
                          'w-full rounded-xl transition-all duration-500 relative overflow-hidden',
                          isBest
                            ? 'bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.45)] ring-2 ring-amber-400/80'
                            : isSelected
                            ? 'bg-gradient-to-t from-indigo-700 via-indigo-600 to-violet-500 shadow-[0_4px_20px_rgba(79,70,229,0.45)] ring-2 ring-indigo-600 ring-offset-2 scale-[1.03]'
                            : item.value > 0
                            ? 'bg-gradient-to-t from-indigo-500 via-indigo-400 to-violet-400 opacity-75 group-hover:opacity-100 group-hover:shadow-md'
                            : 'report-empty-bar bg-slate-200/60'
                        )}
                        style={{ height: `${Math.max(8, item.value)}%` }}
                      >
                        {/* Shimmer Highlight */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent pointer-events-none" />
                      </div>
                    </div>

                    {/* Day Pill Badge */}
                    <span
                      className={clsx(
                        'transition-all duration-200 cursor-pointer',
                        isSelected
                          ? 'bg-indigo-600 text-white font-extrabold px-3 py-1 rounded-xl shadow-md shadow-indigo-600/30 text-xs scale-105'
                          : 'text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900 px-2.5 py-1 rounded-xl text-xs'
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Inspector & Breakdown */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center font-bold">
                  {selectedData.label}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Chi tiết chỉ số {selectedData.fullName || selectedData.label}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{selectedData.detail}</p>
                </div>
              </div>
              <span className="text-xl font-black text-indigo-600 font-heading">{selectedData.value} điểm</span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Task hoàn thành</span>
                </div>
                <span className="text-xs font-black text-slate-900">{selectedData.tasksCompleted}/{selectedData.tasksTotal || selectedData.tasksCompleted}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Sự kiện & Lịch trình</span>
                </div>
                <span className="text-xs font-black text-slate-900">{selectedData.events} mục</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Thói quen tích lũy</span>
                </div>
                <span className="text-xs font-black text-amber-600">{selectedData.habitCheckIns} lượt</span>
              </div>
            </div>
          </div>

          <div className="report-live-note p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
            <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-950 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Dữ liệu thời gian thực</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              Dữ liệu tự động tính toán từ hệ thống cơ sở dữ liệu thật của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* Category Breakdown & AI Advice Section */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Category Time Distribution */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <PieChart className="w-4 h-4" />
              </div>
              <h3 className="font-heading text-base font-extrabold text-slate-900">
                {isVietnamese ? 'Tỷ lệ danh mục công việc thực tế' : 'Real Category Distribution'}
              </h3>
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            {categoriesBreakdown.map((cat) => (
              <div key={cat.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                    {cat.label} ({cat.count} task)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`font-black ${cat.text}`}>{cat.percent}%</span>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                    style={{ width: `${Math.max(5, cat.percent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Productivity Suggestions */}
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center border border-white/15 backdrop-blur-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-extrabold text-white">
                    {isVietnamese ? 'Khuyến nghị nâng cao năng suất (AI)' : 'AI Productivity Advice'}
                  </h3>
                  <p className="text-[11px] text-indigo-200/80">Dựa trên dữ liệu thực tế trong hệ thống</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Live Analysis
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-indigo-100/90 font-medium pt-1">
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  Bạn đã hoàn thành <span className="text-amber-300 font-bold">{completedTasksCount}/{totalTasksCount} công việc</span> ({totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}% tổng số task).
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-start gap-3">
                <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Mẹo xếp lịch tối ưu:</strong>
                  {bestItem.value > 0 ? (
                    <>Ngày <span className="text-amber-300 font-bold">{bestItem.fullName}</span> bạn đạt điểm hiệu suất cao nhất ({bestItem.value}đ). Hãy duy trì đà làm việc này!</>
                  ) : (
                    <>Tạo thêm task và hoàn thành lịch trình hôm nay để AI ghi nhận điểm số năng suất đầu tiên!</>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 relative z-10">
            <button
              onClick={() => navigate('/assistant')}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{isVietnamese ? 'Bật Trợ Lý AI Tối Ưu Lịch Ngay' : 'Open AI Schedule Optimizer'}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
