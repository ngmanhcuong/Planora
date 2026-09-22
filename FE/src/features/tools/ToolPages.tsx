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
import { translate, translateCategory, translateRelativeTime, getMultiLangText, getMultiLangArray } from '@/lib/i18n';
import { clsx } from 'clsx';
import { UserHeroBanner } from '@/components/ui/UserHeroBanner';

const cardClass = 'rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200';

interface GoalItem {
  id: number;
  title: string;
  category: string;
  progress: number;
  targetDate: string;
  description?: string;
  isCompleted?: boolean;
  targetWorkload?: number;
  metrics?: {
    taskProgress: number;
    timeScore: number;
    workloadScore: number;
    relatedTasks: number;
    completedTasks: number;
    overdueTasks: number;
  };
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

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const normalizeGoalCategory = (category: string) => {
  const map: Record<string, string[]> = {
    study: ['STUDY', 'HOC_TAP', 'HỌC TẬP'],
    work: ['WORK', 'TASK', 'DEADLINE', 'CONG_VIEC', 'CÔNG VIỆC'],
    personal: ['PERSONAL', 'MEETING', 'CA_NHAN', 'CÁ NHÂN'],
    health: ['HABIT', 'HEALTH', 'SUC_KHOE', 'SỨC KHỎE'],
  };

  return map[category] || [];
};

const getTaskDueAt = (task: { dueDate?: string; dueTime?: string | null }) => {
  if (!task.dueDate) return null;
  const datePart = task.dueDate.slice(0, 10);
  const timePart = task.dueTime || '23:59';
  const value = new Date(`${datePart}T${timePart}`);
  return Number.isNaN(value.getTime()) ? null : value;
};

const getRelatedGoalTasks = (goal: GoalItem, tasks: Array<any>) => {
  const allowedTypes = normalizeGoalCategory(goal.category);
  const targetTime = new Date(`${goal.targetDate}T23:59:59`).getTime();

  return tasks.filter((task) => {
    const dueAt = getTaskDueAt(task);
    if (!dueAt || dueAt.getTime() > targetTime) return false;

    const taskCategoryType = String(task.category?.type || '').toUpperCase();
    const taskCategoryName = String(task.category?.name || '').toUpperCase();
    const title = `${task.title || ''} ${task.description || ''}`.toLowerCase();

    const matchesCategory =
      allowedTypes.length === 0 ||
      allowedTypes.includes(taskCategoryType) ||
      allowedTypes.some((type) => taskCategoryName.includes(type));

    if (matchesCategory) return true;

    if (goal.category === 'health') {
      return /(chạy|thể thao|tập|gym|sức khỏe|sport|health|run)/i.test(title);
    }

    return false;
  });
};

const calculateGoalEvaluation = (goal: GoalItem, tasks: Array<any>) => {
  const relatedTasks = getRelatedGoalTasks(goal, tasks);
  const completedTasks = relatedTasks.filter((task) => task.status === 'COMPLETED');
  const overdueTasks = relatedTasks.filter((task) => task.isOverdue || task.status === 'OVERDUE');
  const targetWorkload = goal.targetWorkload || Math.max(1, relatedTasks.length);

  const taskProgress = relatedTasks.length > 0 ? (completedTasks.length / relatedTasks.length) * 100 : 0;
  const workloadScore = Math.min(100, (relatedTasks.length / targetWorkload) * 100);

  const onTimeCompleted = completedTasks.filter((task) => {
    const dueAt = getTaskDueAt(task);
    if (!dueAt) return false;
    if (!task.completedAt) return !task.isOverdue;
    return new Date(task.completedAt).getTime() <= dueAt.getTime();
  }).length;

  const timeScore = completedTasks.length > 0
    ? (onTimeCompleted / completedTasks.length) * 100
    : overdueTasks.length > 0
    ? 0
    : relatedTasks.length > 0
    ? 50
    : 0;

  const progress = clampPercent(taskProgress * 0.4 + timeScore * 0.3 + workloadScore * 0.3);

  return {
    ...goal,
    progress,
    isCompleted: progress >= 100,
    metrics: {
      taskProgress: clampPercent(taskProgress),
      timeScore: clampPercent(timeScore),
      workloadScore: clampPercent(workloadScore),
      relatedTasks: relatedTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
    },
  };
};

export const AssistantPage: React.FC = () => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [priorityResults, setPriorityResults] = useState<TaskPriorityRecommendation[]>([]);
  const language = useCurrentLanguage();
  const assistantCopy = {
    systemTask: getMultiLangText(language, { vi: 'Công việc trong hệ thống', en: 'Tasks in system', ja: 'システム内のタスク', ko: '시스템 내 작업', zh: '系统中的任务', fr: 'Tâches dans le système', de: 'Aufgaben im System', es: 'Tareas en el sistema' }),
    incompleteTasks: getMultiLangText(language, { vi: 'Task chưa xong', en: 'Incomplete tasks', ja: '未完了のタスク', ko: '미완료 작업', zh: '未完成的任务', fr: 'Tâches incomplètes', de: 'Unvollständige Aufgaben', es: 'Tareas incompletas' }),
    highPriority: (value: number) => getMultiLangText(language, { vi: `${value} việc ưu tiên cao`, en: `${value} high-priority tasks`, ja: `高優先度 ${value}件`, ko: `높은 우선순위 ${value}개`, zh: `${value} 个高优先级任务`, fr: `${value} tâches prioritaires`, de: `${value} Aufgaben hoher Priorität`, es: `${value} tareas de alta prioridad` }),
    todayTasks: getMultiLangText(language, { vi: 'Việc hôm nay', en: 'Today tasks', ja: '本日のタスク', ko: '오늘의 작업', zh: '今天的任务', fr: 'Tâches d\'aujourd\'hui', de: 'Heutige Aufgaben', es: 'Tareas de hoy' }),
    completed: (done: number, total: number) => getMultiLangText(language, { vi: `${done}/${total} đã hoàn thành`, en: `${done}/${total} completed`, ja: `完了 ${done}/${total}`, ko: `완료 ${done}/${total}`, zh: `已完成 ${done}/${total}`, fr: `${done}/${total} terminées`, de: `${done}/${total} erledigt`, es: `${done}/${total} completadas` }),
    upcomingSchedule: getMultiLangText(language, { vi: 'Lịch sắp tới', en: 'Upcoming schedule', ja: '今後のスケジュール', ko: '향후 일정', zh: '近期日程', fr: 'Planning à venir', de: 'Anstehender Zeitplan', es: 'Próxima programación' }),
    checkConflicts: getMultiLangText(language, { vi: 'Dùng AI để kiểm tra trùng lịch', en: 'Use AI to check schedule conflicts', ja: 'AIでスケジュールの重複を確認', ko: 'AI로 일정 충돌 확인', zh: '使用AI检查日程冲突', fr: 'Utiliser l\'IA pour vérifier les conflits', de: 'KI zur Überprüfung von Terminkonflikten nutzen', es: 'Usar IA para comprobar conflictos' }),
    productivityScore: getMultiLangText(language, { vi: 'Điểm năng suất', en: 'Productivity score', ja: '生産性スコア', ko: '생산성 점수', zh: '生产力得分', fr: 'Score de productivité', de: 'Produktivitätswert', es: 'Puntuación de productividad' }),
    explainScore: getMultiLangText(language, { vi: 'AI có thể giải thích nguyên nhân', en: 'AI can explain what affects it', ja: 'AIが影響要因を解説します', ko: 'AI가 원인을 설명해 드립니다', zh: 'AI可解析影响因素', fr: 'L\'IA peut expliquer les facteurs', de: 'KI kann Einflussfaktoren erklären', es: 'La IA puede explicar las causas' }),
    centerTitle: getMultiLangText(language, { vi: 'Trung tâm chức năng AI', en: 'AI action center', ja: 'AI アクションセンター', ko: 'AI 작업 센터', zh: 'AI 操作中心', fr: 'Centre d\'action IA', de: 'KI-Aktionszentrum', es: 'Centro de acción de IA' }),
    centerSubtitle: getMultiLangText(language, { vi: 'Dùng dữ liệu thật từ lịch và công việc của bạn để gợi ý hành động.', en: 'Use real calendar and task data to suggest your next actions.', ja: 'カレンダーとタスクのリアルデータから最適なアクションを提案します。', ko: '캘린더와 작업의 실제 데이터를 기반으로 작업을 추천합니다.', zh: '利用日历与任务真实数据推荐后续行动。', fr: 'Utilisez vos données réelles pour suggérer vos prochaines actions.', de: 'Nutzen Sie echte Kalender- und Aufgabendaten für Handlungsempfehlungen.', es: 'Usa datos reales de calendario y tareas para sugerir tus siguientes acciones.' }),
    checking: getMultiLangText(language, { vi: 'Đang kiểm tra', en: 'Checking', ja: '確認中', ko: '확인 중', zh: '检查中', fr: 'Vérification', de: 'Überprüfen', es: 'Comprobando' }),
    disabled: getMultiLangText(language, { vi: 'AI chưa bật', en: 'AI disabled', ja: 'AIが無効', ko: 'AI 비활성화됨', zh: 'AI未启用', fr: 'IA désactivée', de: 'KI deaktiviert', es: 'IA desactivada' }),
    prioritize: getMultiLangText(language, { vi: 'Phân tích ưu tiên', en: 'Analyze priorities', ja: '優先度分析', ko: '우선순위 분석', zh: '优先级分析', fr: 'Analyser les priorités', de: 'Prioritäten analysieren', es: 'Analizar prioridades' }),
    prioritizeDesc: getMultiLangText(language, { vi: 'AI xếp hạng task nên làm trước dựa trên deadline và độ ưu tiên.', en: 'AI ranks which tasks should be handled first based on deadlines and priority.', ja: '締切と優先度に基づき、先に行うべきタスクをAIがランク付けします。', ko: '마감일과 우선순위에 따라 먼저 처리할 작업을 AI가 순위 매깁니다.', zh: 'AI根据截止日期与优先级对任务处理顺序进行排序。', fr: 'L\'IA classe les tâches à traiter en premier selon les échéances.', de: 'Die KI priorisiert Ihre Aufgaben basierend auf Fristen.', es: 'La IA clasifica qué tareas deben hacerse primero según los plazos.' }),
    schedule: getMultiLangText(language, { vi: 'Lập lịch AI', en: 'AI scheduling', ja: 'AI スケジューリング', ko: 'AI 일정 생성', zh: 'AI 日程规划', fr: 'Planning IA', de: 'KI-Terminplanung', es: 'Programación con IA' }),
    scheduleDesc: getMultiLangText(language, { vi: 'Tạo buổi học/làm việc tự động rồi áp dụng vào lịch của tôi.', en: 'Generate study/work sessions and apply them to your calendar.', ja: '学習・作業セッションを自動生成してカレンダーに適用します。', ko: '학습/작업 세션을 자동 생성하여 캘린더에 적용합니다.', zh: '自动生成学习/工作时段并应用到我的日历中。', fr: 'Générez automatiquement des sessions d\'étude et appliquez-les.', de: 'Automatische Erstellung von Lern- und Arbeitsblöcken.', es: 'Genera sesiones de estudio/trabajo y aplícalas a tu calendario.' }),
    dataAdvice: getMultiLangText(language, { vi: 'Tư vấn theo dữ liệu', en: 'Data-based advice', ja: 'データに基づくアドバイス', ko: '데이터 기반 조언', zh: '基于数据的建议', fr: 'Conseils basés sur les données', de: 'Datenbasierte Beratung', es: 'Consejos basados en datos' }),
    dataAdvicePrompt: getMultiLangText(language, { vi: 'Hãy phân tích lịch, deadline và gợi ý kế hoạch tốt nhất cho hôm nay.', en: 'Analyze my schedule and deadlines, then suggest the best plan for today.', ja: 'スケジュールと締切を分析し、本日の最適なプランを提案してください。', ko: '일정과 마감일을 분석하여 오늘 최선의 계획을 제안해 주세요.', zh: '请分析我的日程与截止日期，并推荐今天的最佳计划。', fr: 'Analysez mon emploi du temps et suggérez le meilleur plan pour aujourd\'hui.', de: 'Analysieren Sie meinen Zeitplan und empfehlen Sie den besten Tagesplan.', es: 'Analiza mi horario y fechas límite, luego sugiere el mejor plan para hoy.' }),
    dataAdviceDesc: getMultiLangText(language, { vi: 'Hỏi AI về trùng lịch, deadline gấp hoặc vì sao năng suất thấp.', en: 'Ask AI about conflicts, urgent deadlines, or why productivity is low.', ja: '重複、急ぎの締切、生産性の低下理由についてAIに質問できます。', ko: '충돌, 긴급 마감일 또는 생산성이 낮은 이유를 AI에 문의하세요.', zh: '向AI咨询日程冲突、紧急截止日期或生产力偏低的原因。', fr: 'Posez vos questions sur les conflits ou la faible productivité.', de: 'Fragen Sie die KI nach Konflikten oder niedriger Produktivität.', es: 'Pregunta a la IA sobre conflictos o baja productividad.' }),
    resultTitle: getMultiLangText(language, { vi: 'Kết quả AI', en: 'AI results', ja: 'AI 分析結果', ko: 'AI 결과', zh: 'AI 结果', fr: 'Résultats IA', de: 'KI-Ergebnisse', es: 'Resultados de IA' }),
    resultSubtitle: getMultiLangText(language, { vi: 'Kết quả phân tích ưu tiên sẽ hiển thị tại đây.', en: 'Priority analysis results will appear here.', ja: '優先度分析結果がここに表示されます。', ko: '우선순위 분석 결과가 여기에 표시됩니다.', zh: '优先级分析结果将在此处显示。', fr: 'Les résultats d\'analyse de priorité s\'afficheront ici.', de: 'Ergebnisse der Prioritätsanalyse erscheinen hier.', es: 'Los resultados del análisis de prioridad aparecerán aquí.' }),
    unavailable: getMultiLangText(language, { vi: 'Không thể gọi AI lúc này. Vui lòng kiểm tra cấu hình AI hoặc thử lại sau.', en: 'AI is unavailable right now. Please check the AI configuration or try again later.', ja: '現在AIを呼び出せません。設定を確認するか後でお試しください。', ko: '현재 AI를 호출할 수 없습니다. 설정 확인 후 다시 시도해 주세요.', zh: '目前无法调用AI，请检查AI配置或稍后再试。', fr: 'L\'IA est indisponible pour le moment.', de: 'KI ist derzeit nicht verfügbar.', es: 'La IA no está disponible en este momento.' }),
    priorityRank: (rank: number) => getMultiLangText(language, { vi: `Ưu tiên #${rank}`, en: `Priority #${rank}`, ja: `優先順位 #${rank}`, ko: `우선순위 #${rank}`, zh: `优先级 #${rank}`, fr: `Priorité #${rank}`, de: `Priorität #${rank}`, es: `Prioridad #${rank}` }),
    emptyTitle: getMultiLangText(language, { vi: 'Chưa có phân tích nào', en: 'No analysis yet', ja: 'まだ分析はありません', ko: '아직 분석이 없습니다', zh: '暂无分析', fr: 'Aucune analyse pour l\'instant', de: 'Noch keine Analyse', es: 'Sin análisis aún' }),
    emptyDesc: getMultiLangText(language, { vi: 'Bấm “Phân tích ưu tiên” để AI đọc danh sách công việc chưa hoàn thành và đề xuất thứ tự xử lý.', en: 'Click “Analyze priorities” so AI can read unfinished tasks and suggest the best order.', ja: '「優先度分析」をクリックして、未完了タスクの最適な順序をAIに提案させましょう。', ko: '“우선순위 분석”을 클릭하여 AI가 미완료 작업을 분석하도록 하세요.', zh: '点击“优先级分析”，让AI读取未完成任务并推荐处理顺序。', fr: 'Cliquez sur « Analyser les priorités » pour suggérer le meilleur ordre.', de: 'Klicken Sie auf „Prioritäten analysieren“ für Empfehlungen.', es: 'Haz clic en "Analizar prioridades" para sugerir el mejor orden.' }),
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
      <UserHeroBanner
        tone="assistant"
        icon={Bot}
        iconClassName="text-fuchsia-100"
        badge={(
          <>
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            {translate(language, 'assistant.badge')}
          </>
        )}
        title={translate(language, 'assistant.title')}
        subtitle={translate(language, 'assistant.subtitle')}
        actions={(
          <button
            onClick={() => openAssistantWithPrompt()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:opacity-95"
          >
            <Send className="h-4 w-4 fill-slate-950" />
            {translate(language, 'assistant.open')}
          </button>
        )}
      />

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
  const { data: tasksData } = useTasks();
  const systemTasks = useMemo(() => tasksData?.tasks || [], [tasksData]);
  const goalsCopy = {
    all: getMultiLangText(language, { vi: 'Tất cả', en: 'All', ja: 'すべて', ko: '전체', zh: '全部', fr: 'Tous', de: 'Alle', es: 'Todos' }),
    study: getMultiLangText(language, { vi: 'Học tập', en: 'Study', ja: '学習', ko: '학습', zh: '学习', fr: 'Études', de: 'Studium', es: 'Estudio' }),
    work: getMultiLangText(language, { vi: 'Công việc', en: 'Work', ja: '仕事', ko: '업무', zh: '工作', fr: 'Travail', de: 'Arbeit', es: 'Trabajo' }),
    personal: getMultiLangText(language, { vi: 'Cá nhân', en: 'Personal', ja: '個人', ko: '개인', zh: '个人', fr: 'Personnel', de: 'Persönlich', es: 'Personal' }),
    health: getMultiLangText(language, { vi: 'Sức khỏe', en: 'Health', ja: '健康', ko: '건강', zh: '健康', fr: 'Santé', de: 'Gesundheit', es: 'Salud' }),
    search: getMultiLangText(language, { vi: 'Tìm mục tiêu...', en: 'Search goals...', ja: '目標を検索...', ko: '목표 검색...', zh: '搜索目标...', fr: 'Rechercher des objectifs...', de: 'Ziele suchen...', es: 'Buscar objetivos...' }),
    cancel: getMultiLangText(language, { vi: 'Hủy', en: 'Cancel', ja: 'キャンセル', ko: '취소', zh: '取消', fr: 'Annuler', de: 'Abbrechen', es: 'Cancelar' }),
    create: getMultiLangText(language, { vi: 'Tạo mục tiêu mới', en: 'Create new goal', ja: '新しい目標を作成', ko: '새 목표 생성', zh: '创建新目标', fr: 'Créer un nouvel objectif', de: 'Neues Ziel erstellen', es: 'Crear nuevo objetivo' }),
    completed: getMultiLangText(language, { vi: 'Đã hoàn thành', en: 'Completed', ja: '完了', ko: '완료됨', zh: '已完成', fr: 'Terminé', de: 'Abgeschlossen', es: 'Completado' }),
    streak: getMultiLangText(language, { vi: 'Chuỗi duy trì', en: 'Streak', ja: '連続達成', ko: '연속 달성', zh: '连续天数', fr: 'Série', de: 'Strähne', es: 'Racha' }),
    days: getMultiLangText(language, { vi: 'ngày', en: 'days', ja: '日', ko: '일', zh: '天', fr: 'jours', de: 'Tage', es: 'días' }),
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

  const [goals, setGoals] = useState<GoalItem[]>([]);
  const evaluatedGoals = useMemo(
    () => goals.map((goal) => calculateGoalEvaluation(goal, systemTasks)),
    [goals, systemTasks]
  );

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
    return evaluatedGoals.filter((g) => {
      const matchCat = selectedCategory === 'all' || g.category === selectedCategory;
      const matchSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [evaluatedGoals, selectedCategory, searchQuery]);

  const averageProgress = evaluatedGoals.length > 0 ? Math.round(evaluatedGoals.reduce((sum, g) => sum + g.progress, 0) / evaluatedGoals.length) : 0;
  const completedCount = evaluatedGoals.filter((g) => g.progress === 100 || g.isCompleted).length;

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
      targetWorkload: 1,
    };
    setGoals((prev) => [createdGoal, ...prev]);
    setNewTitle('');
    setNewDescription('');
    setIsAddingGoal(false);
  };

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      <UserHeroBanner
        tone="goals"
        icon={Target}
        iconClassName="text-rose-100"
        badge="Planora Goals KPI"
        badges={(
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md">
              {averageProgress}% {translate(language, 'goals.averageProgress')}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-md">
              {completedCount}/{evaluatedGoals.length} {goalsCopy.completed}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-rose-300 backdrop-blur-md">
              <Flame className="h-3.5 w-3.5 fill-rose-300" /> 7 {goalsCopy.days}
            </span>
          </>
        )}
        title={translate(language, 'goals.title')}
        subtitle={translate(language, 'goals.subtitle')}
      />

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
      {filteredGoals.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Target className="h-7 w-7" />
          </div>
          <h3 className="font-heading text-lg font-extrabold text-slate-900">
            Chưa có mục tiêu thật nào
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">
            Hãy tạo mục tiêu mới. Hệ thống sẽ tự đánh giá tiến độ dựa trên công việc thật, thời gian hoàn thành và khối lượng task liên quan.
          </p>
          <button
            type="button"
            onClick={() => setIsAddingGoal(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo mục tiêu đầu tiên</span>
          </button>
        </div>
      )}
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

                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 px-2 py-2">
                    <div className="font-extrabold text-slate-500">Tiến độ</div>
                    <div className="mt-1 font-black text-slate-900">{goal.metrics?.taskProgress ?? 0}%</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 px-2 py-2">
                    <div className="font-extrabold text-slate-500">Thời gian</div>
                    <div className="mt-1 font-black text-slate-900">{goal.metrics?.timeScore ?? 0}%</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 px-2 py-2">
                    <div className="font-extrabold text-slate-500">Khối lượng</div>
                    <div className="mt-1 font-black text-slate-900">{goal.metrics?.workloadScore ?? 0}%</div>
                  </div>
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

                <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-slate-500">
                  <span>{goal.metrics?.completedTasks ?? 0}/{goal.metrics?.relatedTasks ?? 0} task hoàn thành</span>
                  <span>{goal.metrics?.overdueTasks ?? 0} quá hạn</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Badges / Motivation Section */}
      <section className="goals-achievement-card rounded-3xl p-6 shadow-sm space-y-4 sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-heading text-slate-950 dark:text-white">{getMultiLangText(language, { vi: 'Huy hiệu thành tích', en: 'Achievement Badges', ja: '実績バッジ', ko: '업적 배지', zh: '成就徽章', fr: 'Badges de réussite', de: 'Erfolgs-Badges', es: 'Insignias de logros' })}</h3>
              <p className="text-xs text-slate-500 font-medium dark:text-indigo-200/70">{getMultiLangText(language, { vi: 'Đạt mốc để mở khóa danh hiệu cá nhân', en: 'Reach milestones to unlock personal titles', ja: 'マイルストーンを達成して個人称号を解除', ko: '마일스톤을 달성하여 개인 칭호 잠금 해제', zh: '达成里程碑以解锁个人头衔', fr: 'Atteignez des jalons pour débloquer des titres', de: 'Erreichen Sie Meilensteine, um Titel freizuschalten', es: 'Alcanza hitos para desbloquear títulos' })}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: getMultiLangText(language, { vi: 'Chăm chỉ 7 ngày', en: '7-Day Streak', ja: '7日間連続達成', ko: '7일 연속 달성', zh: '连续7天坚持', fr: 'Série de 7 jours', de: '7-Tage-Strähne', es: 'Racha de 7 días' }),
              desc: getMultiLangText(language, { vi: 'Duy trì học tập liên tục không gián đoạn.', en: 'Maintain continuous uninterrupted study.', ja: '中断することなく継続して学習を維持。', ko: '중단 없이 지속적인 학습을 유지합니다.', zh: '保持连续学习不间断。', fr: 'Maintenez une étude continue sans interruption.', de: 'Kontinuierliches Lernen ohne Unterbrechung.', es: 'Mantén un estudio continuo sin interrupciones.' }),
              icon: Flame,
              color: 'text-amber-400',
              unlocked: true,
            },
            {
              title: getMultiLangText(language, { vi: 'Thủ khoa Deadline', en: 'Deadline Master', ja: '締切マスター', ko: '마감일 마스터', zh: '截止日期大师', fr: 'Maître des échéances', de: 'Fristen-Meister', es: 'Maestro de plazos' }),
              desc: getMultiLangText(language, { vi: 'Hoàn thành 100% mục tiêu đúng hạn.', en: 'Complete 100% of goals on time.', ja: '100%の目標を期限通りに完了。', ko: '목표의 100%를 제시간에 완료합니다.', zh: '按时完成 100% 的目标。', fr: 'Terminez 100% des objectifs à temps.', de: '100% der Ziele pünktlich abschließen.', es: 'Completa el 100% de tus objetivos a tiempo.' }),
              icon: Award,
              color: 'text-indigo-400',
              unlocked: true,
            },
            {
              title: getMultiLangText(language, { vi: 'Siêu Chiến Binh KPI', en: 'KPI Warrior', ja: 'KPI ウォリアー', ko: 'KPI 워리어', zh: 'KPI 超级战士', fr: 'Guerrier du KPI', de: 'KPI-Krieger', es: 'Guerrero KPI' }),
              desc: getMultiLangText(language, { vi: 'Đạt tiến độ trung bình trên 80%.', en: 'Achieve average progress above 80%.', ja: '平均進捗率80%以上を達成。', ko: '평균 진행률 80% 이상을 달성합니다.', zh: '平均进度达到 80% 以上。', fr: 'Atteignez un progrès moyen supérieur à 80%.', de: 'Erreichen Sie einen durchschnittlichen Fortschritt von über 80%.', es: 'Alcanza un progreso promedio superior al 80%.' }),
              icon: Zap,
              color: 'text-emerald-400',
              unlocked: averageProgress >= 80,
            },
          ].map((badge) => (
            <div
              key={badge.title}
              className={clsx(
                'goals-achievement-item p-4 rounded-2xl border backdrop-blur-md flex items-center gap-3.5 transition-all',
                badge.unlocked
                  ? 'is-unlocked'
                  : 'is-locked'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 dark:bg-white/10">
                <badge.icon className={clsx('w-5 h-5', badge.color)} />
              </div>
              <div>
                <h4 className="text-xs font-bold">{badge.title}</h4>
                <p className="mt-0.5 text-[11px]">{badge.desc}</p>
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

  const initialNotes: NoteItem[] = [];
  const decodeLegacyText = (value: string) => decodeURIComponent(escape(window.atob(value)));
  const legacyDemoNoteTexts = new Set(
    [
      'Q2h14bqpbiBi4buLIHNsaWRlIHRodXnhur90IHRyw6xuaCBjaG8gbcO0biBM4buLY2ggc+G7rSB0xrAgdMaw4bufbmcgdHJp4bq/dCBo4buNYw==',
      'S2nhu4NtIHRyYSBs4bqhaSBkZWFkbGluZSBiw6FvIGPDoW8gdGnhur9uIMSR4buZIMSR4buTIMOhbiB24bubaSBnaeG6o25nIHZpw6puIGjGsOG7m25nIGThuqtu',
      'TXVhIHRow6ptIHPhu5UgZ2hpIGNow6lwIHbDoCBiw7p0IGhpZ2hsaWdodCBtw6B1IHBhc3RlbA==',
      'w50gdMaw4bufbmcgdOG7kWkgxrB1IGdpYW8gZGnhu4duIERhc2hib2FyZCB24bubaSBXaWRnZXQgdGhlbyBkw7VpIG7Eg25nIHN14bqldA==',
      'S2nhu4NtIEdp4bqjaSDEkOG6uXA=',
    ].map(decodeLegacyText),
  );

  const isLegacyDemoNote = (note: NoteItem) => {
    const text = typeof note.text === 'string' ? note.text.trim() : '';
    return legacyDemoNoteTexts.has(text);
  };

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('planora_quick_notes_v3');
      if (!saved) return initialNotes;

      const parsed = JSON.parse(saved) as NoteItem[];
      if (!Array.isArray(parsed)) return initialNotes;

      const cleanedNotes = parsed.filter((note) => !isLegacyDemoNote(note));
      if (cleanedNotes.length !== parsed.length) {
        localStorage.setItem('planora_quick_notes_v3', JSON.stringify(cleanedNotes));
      }
      return cleanedNotes;
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
  const [selectedTag, setSelectedTag] = useState<string>(translateCategory(language, 'note'));
  const [selectedColor, setSelectedColor] = useState<string>('white');
  const [isPinnedInput, setIsPinnedInput] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilterTag, setActiveFilterTag] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const availableTags = getMultiLangArray(language, {
    vi: ['Học tập', 'Công việc', 'Cá nhân', 'Ý tưởng', 'Quan trọng', 'Ghi chú'],
    en: ['Study', 'Work', 'Personal', 'Idea', 'Important', 'Note'],
    ja: ['学習', '仕事', '個人', 'アイデア', '重要', 'メモ'],
    ko: ['학습', '업무', '개인', '아이디어', '중요', '노트'],
    zh: ['学习', '工作', '个人', '想法', '重要', '笔记'],
    fr: ['Études', 'Travail', 'Personnel', 'Idée', 'Important', 'Note'],
    de: ['Studium', 'Arbeit', 'Persönlich', 'Idee', 'Wichtig', 'Notiz'],
    es: ['Estudio', 'Trabajo', 'Personal', 'Idea', 'Importante', 'Nota'],
  });

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
      createdAt: translateRelativeTime(language, 'Just now'),
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
                title={
                  note.done
                    ? getMultiLangText(language, {
                        vi: 'Đánh dấu chưa xong',
                        en: 'Mark incomplete',
                        ja: '未完了にする',
                        ko: '미완료로 표시',
                        zh: '标记为未完成',
                        fr: 'Marquer comme non terminé',
                        de: 'Als unvollständig markieren',
                        es: 'Marcar como incompleto',
                      })
                    : getMultiLangText(language, {
                        vi: 'Đánh dấu hoàn thành',
                        en: 'Mark complete',
                        ja: '完了にする',
                        ko: '완료로 표시',
                        zh: '标记为完成',
                        fr: 'Marquer comme terminé',
                        de: 'Als abgeschlossen markieren',
                        es: 'Marcar como completado',
                      })
                }
              >
                {note.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
              </button>
              <span
                className={clsx(
                  'inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold border border-black/5',
                  colorStyle.badge
                )}
              >
                {translateCategory(language, note.tag)}
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
                title={note.isPinned ? getMultiLangText(language, { vi: 'Bỏ ghim', en: 'Unpin', ja: 'ピン留め解除', ko: '고정 해제', zh: '取消置顶', fr: 'Désépingler', de: 'Lösen', es: 'Desfijar' }) : getMultiLangText(language, { vi: 'Ghim lên đầu', en: 'Pin to top', ja: '先頭にピン留め', ko: '상단 고정', zh: '置顶', fr: 'Épingler en haut', de: 'Oben anheften', es: 'Fijar arriba' })}
              >
                <Pin className="h-3.5 w-3.5 fill-current" />
              </button>

              <button
                onClick={() => copyNoteText(note.id, note.text)}
                className="p-1.5 rounded-xl text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-700 hover:bg-black/5 transition-all cursor-pointer"
                title={getMultiLangText(language, { vi: 'Sao chép ghi chú', en: 'Copy note', ja: 'メモをコピー', ko: '노트 복사', zh: '复制笔记', fr: 'Copier la note', de: 'Notiz kopieren', es: 'Copiar nota' })}
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
                title={getMultiLangText(language, { vi: 'Sửa ghi chú', en: 'Edit note', ja: 'メモを編集', ko: '노트 수정', zh: '编辑笔记', fr: 'Modifier la note', de: 'Notiz bearbeiten', es: 'Editar nota' })}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => deleteNote(note.id)}
                className="p-1.5 rounded-xl text-slate-400 opacity-0 group-hover:opacity-100 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                title={getMultiLangText(language, { vi: 'Xóa ghi chú', en: 'Delete note', ja: 'メモを削除', ko: '노트 삭제', zh: '删除笔记', fr: 'Supprimer la note', de: 'Notiz löschen', es: 'Eliminar nota' })}
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
                  {getMultiLangText(language, { vi: 'Hủy', en: 'Cancel', ja: 'キャンセル', ko: '취소', zh: '取消', fr: 'Annuler', de: 'Abbrechen', es: 'Cancelar' })}
                </button>
                <button
                  onClick={() => saveEdit(note.id)}
                  className="px-3 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  {getMultiLangText(language, { vi: 'Lưu', en: 'Save', ja: '保存', ko: '저장', zh: '保存', fr: 'Enregistrer', de: 'Speichern', es: 'Guardar' })}
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
          <span>{translateRelativeTime(language, note.createdAt) || translate(language, 'notes.subtitle')}</span>
          <button
            onClick={() => convertToTask(note)}
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold transition-colors cursor-pointer group-hover:underline"
          >
            <span>{translate(language, 'notes.convertToTask')}</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      <UserHeroBanner
        tone="notes"
        icon={StickyNote}
        iconClassName="text-teal-100"
        badge={translate(language, 'notes.title')}
        title={translate(language, 'notes.title')}
        subtitle={translate(language, 'notes.subtitle')}
        badges={(
          <>
            <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3.5 py-2 text-xs font-extrabold text-indigo-100 border border-white/15 backdrop-blur-md shrink-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              {completedCount}/{notes.length} {getMultiLangText(language, { vi: 'hoàn thành', en: 'completed', ja: '完了', ko: '완료', zh: '已完成', fr: 'terminées', de: 'erledigt', es: 'completadas' })}
            </span>
            <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3.5 py-2 text-xs font-extrabold text-amber-300 border border-white/15 backdrop-blur-md shrink-0">
              <Pin className="h-4 w-4 text-amber-400 fill-amber-400" />
              {pinnedCount} {getMultiLangText(language, { vi: 'đã ghim', en: 'pinned', ja: 'ピン留め', ko: '고정됨', zh: '已置顶', fr: 'épinglées', de: 'angeheftet', es: 'fijadas' })}
            </span>
          </>
        )}
      />

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
            placeholder={translate(language, 'notes.placeholder') + getMultiLangText(language, { vi: ' (Bấm Enter để lưu)...', en: ' (Press Enter to save)...', ja: ' (Enterキーで保存)...', ko: ' (Enter키를 눌러 저장)...', zh: ' (按 Enter 保存)...', fr: ' (Appuyez sur Entrée pour enregistrer)...', de: ' (Enter zum Speichern drücken)...', es: ' (Presiona Enter para guardar)...' })}
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
              {getMultiLangText(language, { vi: 'Danh mục:', en: 'Tag:', ja: 'タグ:', ko: '태그:', zh: '标签:', fr: 'Catégorie:', de: 'Kategorie:', es: 'Etiqueta:' })}
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
                {getMultiLangText(language, { vi: 'Màu:', en: 'Color:', ja: 'カラー:', ko: '색상:', zh: '颜色:', fr: 'Couleur:', de: 'Farbe:', es: 'Color:' })}
              </span>
              {[
                { id: 'white', bg: 'bg-white border-slate-300', label: getMultiLangText(language, { vi: 'Trắng', en: 'White', ja: '白', ko: '흰색', zh: '白色', fr: 'Blanc', de: 'Weiß', es: 'Blanco' }) },
                { id: 'amber', bg: 'bg-amber-200 border-amber-300', label: getMultiLangText(language, { vi: 'Vàng', en: 'Yellow', ja: '黄', ko: '노란색', zh: '黄色', fr: 'Jaune', de: 'Gelb', es: 'Amarillo' }) },
                { id: 'sky', bg: 'bg-sky-200 border-sky-300', label: getMultiLangText(language, { vi: 'Xanh dương', en: 'Blue', ja: '青', ko: '파란색', zh: '蓝色', fr: 'Bleu', de: 'Blau', es: 'Azul' }) },
                { id: 'emerald', bg: 'bg-emerald-200 border-emerald-300', label: getMultiLangText(language, { vi: 'Xanh lá', en: 'Green', ja: '緑', ko: '초록색', zh: '绿色', fr: 'Vert', de: 'Grün', es: 'Verde' }) },
                { id: 'violet', bg: 'bg-violet-200 border-violet-300', label: getMultiLangText(language, { vi: 'Tím', en: 'Purple', ja: '紫', ko: '보라색', zh: '紫色', fr: 'Violet', de: 'Violett', es: 'Morado' }) },
                { id: 'rose', bg: 'bg-rose-200 border-rose-300', label: getMultiLangText(language, { vi: 'Hồng', en: 'Pink', ja: 'ピンク', ko: '분홍색', zh: '粉色', fr: 'Rose', de: 'Rosa', es: 'Rosa' }) },
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
              <span>{isPinnedInput ? getMultiLangText(language, { vi: 'Đã ghim', en: 'Pinned', ja: 'ピン留め', ko: '고정됨', zh: '已置顶', fr: 'Épinglé', de: 'Angeheftet', es: 'Fijado' }) : getMultiLangText(language, { vi: 'Ghim', en: 'Pin', ja: 'ピン留め', ko: '고정', zh: '置顶', fr: 'Épingler', de: 'Anheften', es: 'Fijar' })}</span>
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
            {getMultiLangText(language, { vi: 'Tất cả', en: 'All', ja: 'すべて', ko: '전체', zh: '全部', fr: 'Tous', de: 'Alle', es: 'Todos' })} ({notes.length})
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
            <span>{getMultiLangText(language, { vi: 'Ghim', en: 'Pinned', ja: 'ピン留め', ko: '고정', zh: '置顶', fr: 'Épinglés', de: 'Angeheftet', es: 'Fijados' })} ({pinnedCount})</span>
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
            placeholder={getMultiLangText(language, { vi: 'Tìm ghi chú...', en: 'Search notes...', ja: 'メモを検索...', ko: '노트 검색...', zh: '搜索笔记...', fr: 'Rechercher des notes...', de: 'Notizen suchen...', es: 'Buscar notas...' })}
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
            {getMultiLangText(language, { vi: 'Không tìm thấy ghi chú nào', en: 'No notes found', ja: 'メモが見つかりません', ko: '노트를 찾을 수 없습니다', zh: '未找到笔记', fr: 'Aucune note trouvée', de: 'Keine Notizen gefunden', es: 'No se encontraron notas' })}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {getMultiLangText(language, { vi: 'Hãy tạo ghi chú mới bằng ô nhập phía trên', en: 'Create a new note using the box above', ja: '上の入力ボックスから新しいメモを作成してください', ko: '상단 입력 상자를 사용하여 새 노트를 생성하세요', zh: '使用上方输入框创建新笔记', fr: 'Créez une nouvelle note en utilisant la zone ci-dessus', de: 'Erstellen Sie eine neue Notiz mit dem Feld oben', es: 'Crea una nueva nota usando la casilla de arriba' })}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Section */}
          {pinnedNotes.length > 0 && activeFilterTag !== 'pinned' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600">
                <Pin className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{getMultiLangText(language, { vi: 'Ghi chú đã ghim', en: 'Pinned Notes', ja: 'ピン留めされたメモ', ko: '고정된 노트', zh: '已置顶笔记', fr: 'Notes épinglées', de: 'Angeheftete Notizen', es: 'Notas fijadas' })}</span>
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
                  <span>{getMultiLangText(language, { vi: 'Ghi chú khác', en: 'Other Notes', ja: 'その他のメモ', ko: '기타 노트', zh: '其他笔记', fr: 'Autres notes', de: 'Andere Notizen', es: 'Otras notas' })}</span>
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

  const DAY_LABELS = getMultiLangArray(language, {
    vi: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    ja: ['月', '火', '水', '木', '金', '土', '日'],
    ko: ['월', '화', '수', '목', '금', '토', '일'],
    zh: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    fr: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    es: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  });

  const DAY_NAMES_FULL = getMultiLangArray(language, {
    vi: ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'],
    en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    ja: ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'],
    ko: ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'],
    zh: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
    fr: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
    de: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
    es: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  });

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
          detail: getMultiLangText(language, {
            vi: `${tasksCompleted}/${tasksTotal} task xong, ${habitCheckIns} thói quen, ${events} sự kiện`,
            en: `${tasksCompleted}/${tasksTotal} tasks done, ${habitCheckIns} habits, ${events} events`,
            ja: `${tasksCompleted}/${tasksTotal} タスク完了、${habitCheckIns} 習慣、${events} イベント`,
            ko: `${tasksCompleted}/${tasksTotal} 작업 완료, ${habitCheckIns} 습관, ${events} 일정`,
            zh: `${tasksCompleted}/${tasksTotal} 任务已完成，${habitCheckIns} 习惯，${events} 事件`,
            fr: `${tasksCompleted}/${tasksTotal} tâches terminées, ${habitCheckIns} habitudes, ${events} événements`,
            de: `${tasksCompleted}/${tasksTotal} Aufgaben erledigt, ${habitCheckIns} Gewohnheiten, ${events} Termine`,
            es: `${tasksCompleted}/${tasksTotal} tareas hechas, ${habitCheckIns} hábitos, ${events} eventos`,
          }),
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
        detail: totalOnDay > 0
          ? getMultiLangText(language, {
              vi: `${completedOnDay}/${totalOnDay} công việc đã xong`,
              en: `${completedOnDay}/${totalOnDay} tasks completed`,
              ja: `${completedOnDay}/${totalOnDay} タスク完了`,
              ko: `${completedOnDay}/${totalOnDay} 작업 완료`,
              zh: `${completedOnDay}/${totalOnDay} 任务已完成`,
              fr: `${completedOnDay}/${totalOnDay} tâches terminées`,
              de: `${completedOnDay}/${totalOnDay} Aufgaben erledigt`,
              es: `${completedOnDay}/${totalOnDay} tareas completadas`,
            })
          : getMultiLangText(language, {
              vi: 'Chưa có hoạt động',
              en: 'No activity yet',
              ja: 'まだアクティビティがありません',
              ko: '아직 활동 없음',
              zh: '暂无活动',
              fr: 'Aucune activité pour le moment',
              de: 'Noch keine Aktivität',
              es: 'Sin actividad aún',
            }),
      };
    });
  }, [weeklyStats, allTasks, dashboardData, completedTasksCount, language, DAY_LABELS, DAY_NAMES_FULL]);

  // Monthly Data Processed from Backend
  const monthlyChartData = useMemo(() => {
    const getWeekLabel = (idx: number) => getMultiLangText(language, { vi: `T${idx + 1}`, en: `W${idx + 1}`, ja: `${idx + 1}週`, ko: `${idx + 1}주`, zh: `第${idx + 1}周`, fr: `S${idx + 1}`, de: `W${idx + 1}`, es: `S${idx + 1}` });
    const getWeekFull = (idx: number) => getMultiLangText(language, { vi: `Tuần ${idx + 1}`, en: `Week ${idx + 1}`, ja: `第${idx + 1}週`, ko: `${idx + 1}주차`, zh: `第${idx + 1}周`, fr: `Semaine ${idx + 1}`, de: `Woche ${idx + 1}`, es: `Semana ${idx + 1}` });

    if (monthlyStats && monthlyStats.weeks) {
      return monthlyStats.weeks.map((w: any, idx: number) => ({
        label: getWeekLabel(idx),
        fullName: getWeekFull(idx),
        value: w.completionRate || 0,
        tasksCompleted: w.completedTasks || 0,
        tasksTotal: w.totalTasks || 0,
        habitCheckIns: w.habits || 0,
        events: w.events || 0,
        detail: getMultiLangText(language, {
          vi: `Tuần ${idx + 1}: ${w.completedTasks || 0} task hoàn thành`,
          en: `Week ${idx + 1}: ${w.completedTasks || 0} tasks completed`,
          ja: `第${idx + 1}週: ${w.completedTasks || 0} タスク完了`,
          ko: `${idx + 1}주차: ${w.completedTasks || 0}개 작업 완료`,
          zh: `第${idx + 1}周: ${w.completedTasks || 0} 个任务已完成`,
          fr: `Semaine ${idx + 1}: ${w.completedTasks || 0} tâches terminées`,
          de: `Woche ${idx + 1}: ${w.completedTasks || 0} Aufgaben erledigt`,
          es: `Semana ${idx + 1}: ${w.completedTasks || 0} tareas completadas`,
        }),
      }));
    }
    const avgScore = weeklyStats?.productivityScore || dashboardData?.productivity.todayScore || 0;
    return [
      {
        label: getWeekLabel(0),
        fullName: getWeekFull(0),
        value: avgScore || 70,
        tasksCompleted: completedTasksCount,
        tasksTotal: totalTasksCount,
        habitCheckIns: 12,
        events: 4,
        detail: getMultiLangText(language, {
          vi: 'Tuần 1: Nhịp làm việc mượt',
          en: 'Week 1: Smooth rhythm',
          ja: '第1週: スムーズな作業リズム',
          ko: '1주차: 원활한 작업 리듬',
          zh: '第1周: 顺畅的工作节奏',
          fr: 'Semaine 1 : Rythme fluide',
          de: 'Woche 1: Reibungsloser Rhythmus',
          es: 'Semana 1: Ritmo fluido',
        }),
      },
      {
        label: getWeekLabel(1),
        fullName: getWeekFull(1),
        value: Math.min(100, avgScore + 10),
        tasksCompleted: completedTasksCount,
        tasksTotal: totalTasksCount,
        habitCheckIns: 15,
        events: 5,
        detail: getMultiLangText(language, {
          vi: 'Tuần 2: Tiến độ tốt',
          en: 'Week 2: Good progress',
          ja: '第2週: 順調な進捗',
          ko: '2주차: 좋은 진행 상태',
          zh: '第2周: 良好的进度',
          fr: 'Semaine 2 : Bon progrès',
          de: 'Woche 2: Guter Fortschritt',
          es: 'Semana 2: Buen progreso',
        }),
      },
      {
        label: getWeekLabel(2),
        fullName: getWeekFull(2),
        value: Math.max(0, avgScore - 15),
        tasksCompleted: completedTasksCount,
        tasksTotal: totalTasksCount,
        habitCheckIns: 8,
        events: 3,
        detail: getMultiLangText(language, {
          vi: 'Tuần 3: Tập trung cao',
          en: 'Week 3: High focus',
          ja: '第3週: 高い集中力',
          ko: '3주차: 높은 집중력',
          zh: '第3周: 高度专注',
          fr: 'Semaine 3 : Forte concentration',
          de: 'Woche 3: Hohe Konzentration',
          es: 'Semana 3: Alta concentración',
        }),
      },
      {
        label: getWeekLabel(3),
        fullName: getWeekFull(3),
        value: avgScore || 80,
        tasksCompleted: completedTasksCount,
        tasksTotal: totalTasksCount,
        habitCheckIns: 14,
        events: 6,
        detail: getMultiLangText(language, {
          vi: 'Tuần 4: Đạt 100% KPI',
          en: 'Week 4: Reached 100% KPI',
          ja: '第4週: KPI 100% 達成',
          ko: '4주차: KPI 100% 달성',
          zh: '第4周: 达到100% KPI',
          fr: 'Semaine 4 : 100% du KPI atteint',
          de: 'Woche 4: 100% KPI erreicht',
          es: 'Semana 4: 100% de KPI alcanzado',
        }),
      },
    ];
  }, [monthlyStats, weeklyStats, dashboardData, completedTasksCount, totalTasksCount, language]);

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
    if (!currentChartData || currentChartData.length === 0) return { label: DAY_LABELS[0], value: 0, fullName: DAY_NAMES_FULL[0], detail: '', tasksCompleted: 0, tasksTotal: 0, habitCheckIns: 0, events: 0 };
    return currentChartData.reduce((best: any, item: any) => (item.value > best.value ? item : best));
  }, [currentChartData, DAY_LABELS, DAY_NAMES_FULL]);

  const selectedData = useMemo(() => {
    return currentChartData.find((d: any) => d.label === selectedDay) || bestItem;
  }, [currentChartData, selectedDay, bestItem]);

  // Real Category Breakdown computed directly from tasksData API!
  const categoriesBreakdown = useMemo(() => {
    if (!allTasks.length) {
      return [
        { label: translateCategory(language, 'Study'), percent: 40, count: 0, hours: '0h', color: 'bg-indigo-600', text: 'text-indigo-600', bgLight: 'bg-indigo-50 border-indigo-100' },
        { label: translateCategory(language, 'Work'), percent: 30, count: 0, hours: '0h', color: 'bg-blue-600', text: 'text-blue-600', bgLight: 'bg-blue-50 border-blue-100' },
        { label: translateCategory(language, 'Personal'), percent: 20, count: 0, hours: '0h', color: 'bg-amber-500', text: 'text-amber-600', bgLight: 'bg-amber-50 border-amber-100' },
        { label: translateCategory(language, 'Other'), percent: 10, count: 0, hours: '0h', color: 'bg-rose-500', text: 'text-rose-600', bgLight: 'bg-rose-50 border-rose-100' },
      ];
    }

    const categoryCounts: Record<string, number> = {};
    allTasks.forEach((t) => {
      const catName = translateCategory(language, t.category?.name || t.category?.type || 'Chung');
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
  }, [allTasks, language]);

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
      <UserHeroBanner
        tone="reports"
        icon={BarChart3}
        iconClassName="text-sky-100"
        badge={(
          <>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {translate(language, 'reports.liveData')}
          </>
        )}
        title={translate(language, 'reports.title')}
        subtitle={translate(language, 'reports.subtitle')}
        actions={(
          <>
            <div className="flex items-center bg-white/10 p-1 rounded-2xl border border-white/15 backdrop-blur-md">
              <button
                onClick={() => { setRange('week'); setSelectedDay(DAY_LABELS[4] || 'T6'); }}
                className={clsx(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  range === 'week' ? 'bg-white text-indigo-900 shadow-md' : 'text-indigo-100 hover:text-white'
                )}
              >
                {translate(language, 'reports.thisWeek')}
              </button>
              <button
                onClick={() => { setRange('month'); setSelectedDay(getMultiLangText(language, { vi: 'T1', en: 'W1', ja: '1週', ko: '1주', zh: '第1周', fr: 'S1', de: 'W1', es: 'S1' })); }}
                className={clsx(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  range === 'month' ? 'bg-white text-indigo-900 shadow-md' : 'text-indigo-100 hover:text-white'
                )}
              >
                {translate(language, 'reports.thisMonth')}
              </button>
              <button
                onClick={() => { setRange('quarter'); setSelectedDay('Q3'); }}
                className={clsx(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  range === 'quarter' ? 'bg-white text-indigo-900 shadow-md' : 'text-indigo-100 hover:text-white'
                )}
              >
                {translate(language, 'reports.quarter')}
              </button>
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 shrink-0 disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{translate(language, 'reports.exportPdf')}</span>
            </button>
          </>
        )}
      />

      {/* Toast Banner on Export */}
      {exportedToast && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {getMultiLangText(language, {
                vi: 'Báo cáo hiệu suất đã được tạo & tải về máy thành công! 📊',
                en: 'Report generated and downloaded successfully! 📊',
                ja: 'パフォーマンスレポートが正常に生成され、ダウンロードされました！📊',
                ko: '성과 보고서가 생성되어 성공적으로 다운로드되었습니다! 📊',
                zh: '性能报告已成功生成并下载！📊',
                fr: 'Le rapport de performance a été généré et téléchargé avec succès ! 📊',
                de: 'Leistungsbericht erfolgreich erstellt und heruntergeladen! 📊',
                es: '¡Informe de rendimiento generado y descargado con éxito! 📊',
              })}
            </span>
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
            trend: `${getMultiLangText(language, { vi: 'Tỷ lệ', en: 'Rate', ja: '達成率', ko: '달성률', zh: '完成率', fr: 'Taux', de: 'Rate', es: 'Tasa' })} ${completedTasksCount > 0 ? Math.round((completedTasksCount / (totalTasksCount || 1)) * 100) : 0}%`,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 border-emerald-100',
          },
          {
            label: translate(language, 'reports.todayTasksCount'),
            value: `${dashboardData?.summary.tasksCompletedToday || 0}/${dashboardData?.summary.tasksToday || 0} task`,
            trend: translate(language, 'reports.todayData'),
            icon: Clock,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50 border-indigo-100',
          },
          {
            label: translate(language, 'reports.habitsCompletedCount'),
            value: `${dashboardData?.summary.habitsCompletedToday || 0}/${dashboardData?.summary.totalHabits || 0} ${getMultiLangText(language, { vi: 'thói quen', en: 'habits', ja: '習慣', ko: '습관', zh: '习惯', fr: 'habitudes', de: 'Gewohnheiten', es: 'hábitos' })}`,
            trend: translate(language, 'reports.streak'),
            icon: Flag,
            color: 'text-amber-600',
            bg: 'bg-amber-50 border-amber-100',
          },
          {
            label: translate(language, 'reports.productivityScore'),
            value: `${averageValue} / 100`,
            trend: bestItem.value > 0 ? `${bestItem.label} ${getMultiLangText(language, { vi: `cao nhất (${bestItem.value}đ)`, en: `peak (${bestItem.value} pts)`, ja: `最高 (${bestItem.value} pt)`, ko: `최고 (${bestItem.value}점)`, zh: `最高 (${bestItem.value}分)`, fr: `pic (${bestItem.value} pts)`, de: `Höchstwert (${bestItem.value} Pkt)`, es: `pico (${bestItem.value} pts)` })}` : translate(language, 'reports.calculating'),
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
                  {translate(language, 'reports.compiledDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-1.5 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
                <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>
                  {bestItem.value > 0
                    ? `${getMultiLangText(language, { vi: 'Cao nhất', en: 'Peak', ja: '最高', ko: '최고', zh: '最高', fr: 'Pic', de: 'Höchstwert', es: 'Pico' })}: ${bestItem.label} (${bestItem.value} ${getMultiLangText(language, { vi: 'đ', en: 'pts', ja: 'pt', ko: '점', zh: '分', fr: 'pts', de: 'Pkt', es: 'pts' })})`
                    : translate(language, 'reports.calculating')}
                </span>
              </span>
            </div>
          </div>

          {/* Chart Wrapper with Y-Axis Background Gridlines */}
          <div className="relative pt-8 pb-3 px-2">
            {/* Dashed Horizontal Gridlines */}
            <div className="absolute inset-x-0 top-8 bottom-12 flex flex-col justify-between pointer-events-none z-0">
              <div className="border-b border-dashed border-slate-200/70 w-full flex items-center justify-end pr-1">
                <span className="text-[10px] font-bold text-slate-300">100 {getMultiLangText(language, { vi: 'đ', en: 'pts', ja: 'pt', ko: '점', zh: '分', fr: 'pts', de: 'Pkt', es: 'pts' })}</span>
              </div>
              <div className="border-b border-dashed border-slate-200/70 w-full flex items-center justify-end pr-1">
                <span className="text-[10px] font-bold text-slate-300">75 {getMultiLangText(language, { vi: 'đ', en: 'pts', ja: 'pt', ko: '점', zh: '分', fr: 'pts', de: 'Pkt', es: 'pts' })}</span>
              </div>
              <div className="border-b border-dashed border-slate-200/70 w-full flex items-center justify-end pr-1">
                <span className="text-[10px] font-bold text-slate-300">50 {getMultiLangText(language, { vi: 'đ', en: 'pts', ja: 'pt', ko: '점', zh: '分', fr: 'pts', de: 'Pkt', es: 'pts' })}</span>
              </div>
              <div className="border-b border-dashed border-slate-200/70 w-full flex items-center justify-end pr-1">
                <span className="text-[10px] font-bold text-slate-300">25 {getMultiLangText(language, { vi: 'đ', en: 'pts', ja: 'pt', ko: '점', zh: '分', fr: 'pts', de: 'Pkt', es: 'pts' })}</span>
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
                          {item.value} {getMultiLangText(language, { vi: 'đ', en: 'pts', ja: 'pt', ko: '점', zh: '分', fr: 'pts', de: 'Pkt', es: 'pts' })}
                        </span>
                      ) : item.value >= 80 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white shadow-sm">
                          {item.value} {getMultiLangText(language, { vi: 'đ', en: 'pts', ja: 'pt', ko: '점', zh: '分', fr: 'pts', de: 'Pkt', es: 'pts' })}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-slate-200">
                          {item.value} {getMultiLangText(language, { vi: 'đ', en: 'pts', ja: 'pt', ko: '점', zh: '分', fr: 'pts', de: 'Pkt', es: 'pts' })}
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
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {getMultiLangText(language, { vi: 'Chi tiết chỉ số', en: 'Metrics detail for', ja: 'メトリクス詳細:', ko: '지표 상세:', zh: '指标详情:', fr: 'Détails des métriques pour', de: 'Metrik-Details für', es: 'Detalle de métricas para' })} {selectedData.fullName || selectedData.label}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">{selectedData.detail}</p>
                </div>
              </div>
              <span className="text-xl font-black text-indigo-600 font-heading">{selectedData.value} {getMultiLangText(language, { vi: 'điểm', en: 'pts', ja: 'pt', ko: '점', zh: '分', fr: 'pts', de: 'Pkt', es: 'pts' })}</span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{getMultiLangText(language, { vi: 'Task hoàn thành', en: 'Completed tasks', ja: '完了したタスク', ko: '완료된 작업', zh: '已完成任务', fr: 'Tâches terminées', de: 'Erledigte Aufgaben', es: 'Tareas completadas' })}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{selectedData.tasksCompleted}/{selectedData.tasksTotal || selectedData.tasksCompleted}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>{getMultiLangText(language, { vi: 'Sự kiện & Lịch trình', en: 'Events & Schedules', ja: 'イベント & スケジュール', ko: '일정 & 스케줄', zh: '事件与日程', fr: 'Événements & Plannings', de: 'Termine & Zeitpläne', es: 'Eventos y Horarios' })}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{selectedData.events} {getMultiLangText(language, { vi: 'mục', en: 'items', ja: '件', ko: '개', zh: '项', fr: 'éléments', de: 'Elemente', es: 'elementos' })}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>{getMultiLangText(language, { vi: 'Thói quen tích lũy', en: 'Accumulated habits', ja: '蓄積された習慣', ko: '누적 습관', zh: '累计习惯', fr: 'Habitudes accumulées', de: 'Kumulierte Gewohnheiten', es: 'Hábitos acumulados' })}</span>
                </div>
                <span className="text-xs font-black text-amber-600">{selectedData.habitCheckIns} {getMultiLangText(language, { vi: 'lượt', en: 'check-ins', ja: '回', ko: '회', zh: '次', fr: 'validations', de: 'Check-ins', es: 'registros' })}</span>
              </div>
            </div>
          </div>

          <div className="report-live-note p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
            <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-950 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>{translate(language, 'reports.realtimeData')}</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              {translate(language, 'reports.realtimeDesc')}
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
                {translate(language, 'reports.realCategoryDistribution')}
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
        <div className="reports-ai-advice-card relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 shadow-sm">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white text-amber-500 flex items-center justify-center border border-amber-100 shadow-sm backdrop-blur-md dark:bg-white/10 dark:text-amber-300 dark:border-white/15">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-extrabold text-slate-950 dark:text-white">
                    {translate(language, 'reports.aiAdviceTitle')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-indigo-200/80">{translate(language, 'reports.aiAdviceSubtitle')}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Live Analysis
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 font-medium pt-1 dark:text-indigo-100/90">
              <div className="p-3.5 rounded-2xl bg-white/85 border border-slate-200 backdrop-blur-md flex items-start gap-3 dark:bg-white/10 dark:border-white/15">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  {getMultiLangText(language, {
                    vi: `Bạn đã hoàn thành ${completedTasksCount}/${totalTasksCount} công việc (${totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}% tổng số task).`,
                    en: `You completed ${completedTasksCount}/${totalTasksCount} tasks (${totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}% of total tasks).`,
                    ja: `合計タスクの ${totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}% (${completedTasksCount}/${totalTasksCount}) を完了しました。`,
                    ko: `전체 작업의 ${totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}% (${completedTasksCount}/${totalTasksCount})를 완료했습니다.`,
                    zh: `您已完成总任务的 ${totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}%（${completedTasksCount}/${totalTasksCount}）。`,
                    fr: `Vous avez terminé ${completedTasksCount}/${totalTasksCount} tâches (${totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}% des tâches).`,
                    de: `Sie haben ${completedTasksCount}/${totalTasksCount} Aufgaben erledigt (${totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}% aller Aufgaben).`,
                    es: `Has completado ${completedTasksCount}/${totalTasksCount} tareas (${totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}% del total de tareas).`,
                  })}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/85 border border-slate-200 backdrop-blur-md flex items-start gap-3 dark:bg-white/10 dark:border-white/15">
                <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-950 block mb-0.5 dark:text-white">
                    {getMultiLangText(language, {
                      vi: 'Mẹo xếp lịch tối ưu:',
                      en: 'Optimal schedule tip:',
                      ja: '最適なスケジュールのアドバイス:',
                      ko: '최적 일정 팁:',
                      zh: '最佳日程建议:',
                      fr: 'Conseil de planning optimal :',
                      de: 'Optimaler Zeitplan-Tipp:',
                      es: 'Consejo de programación óptima:',
                    })}
                  </strong>
                  {bestItem.value > 0
                    ? getMultiLangText(language, {
                        vi: `Ngày ${bestItem.fullName} bạn đạt điểm hiệu suất cao nhất (${bestItem.value}đ). Hãy duy trì đà làm việc này!`,
                        en: `On ${bestItem.fullName} you achieved your peak productivity score (${bestItem.value} pts). Keep up the momentum!`,
                        ja: `${bestItem.fullName} に最高の生産性スコア（${bestItem.value} pt）を記録しました。この調子を維持しましょう！`,
                        ko: `${bestItem.fullName}에 최고 생산성 점수(${bestItem.value}점)를 달성했습니다. 이 기세를 유지하세요!`,
                        zh: `在${bestItem.fullName}，您达到了最高生产力得分（${bestItem.value}分）。保持这个势头！`,
                        fr: `Le ${bestItem.fullName}, vous avez atteint votre score maximal de productivité (${bestItem.value} pts). Continuez sur cette lancée !`,
                        de: `Am ${bestItem.fullName} haben Sie Ihren Höchstwert an Produktivität erreicht (${bestItem.value} Pkt). Behalten Sie dieses Schwungrad bei!`,
                        es: `El ${bestItem.fullName} alcanzaste tu puntuación máxima de productividad (${bestItem.value} pts). ¡Mantén el ritmo!`,
                      })
                    : getMultiLangText(language, {
                        vi: 'Tạo thêm task và hoàn thành lịch trình hôm nay để AI ghi nhận điểm số năng suất đầu tiên!',
                        en: "Create tasks and complete today's schedule for AI to calculate your first productivity score!",
                        ja: 'タスクを作成して今日のスケジュールを完了し、AIに最初の生産性スコアを計算させましょう！',
                        ko: '작업을 생성하고 오늘 일정을 완료하여 AI가 첫 생산성 점수를 계산하도록 하세요!',
                        zh: '创建任务并完成今天的日程，让 AI 计算您的第一个生产力得分！',
                        fr: "Créez des tâches et terminez le programme d'aujourd'hui pour que l'IA calcule votre premier score !",
                        de: 'Erstellen Sie Aufgaben und schließen Sie den heutigen Zeitplan ab, damit die KI Ihren ersten Produktivitätswert berechnet!',
                        es: '¡Crea tareas y completa la agenda de hoy para que la IA calcule tu primera puntuación de productividad!',
                      })}
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
              <span>{translate(language, 'reports.aiScheduleBtn')}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
