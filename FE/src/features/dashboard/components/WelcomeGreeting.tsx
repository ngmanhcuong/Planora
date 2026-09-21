import React from 'react';
import { Plus, Sparkles, Bot, Calendar as CalendarIcon, CheckCircle2, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, getMultiLangText } from '@/lib/i18n';
export interface WelcomeGreetingProps {
  summary?: {
    tasksToday: number;
    tasksCompletedToday: number;
    upcomingEvents: number;
  };
  onOpenScheduleModal?: () => void;
  onOpenAssistantPanel?: () => void;
};

const LOCALE_MAP: Record<string, string> = {
  vi: 'vi-VN',
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
};

export const WelcomeGreeting: React.FC<WelcomeGreetingProps> = ({
  summary,
  onOpenScheduleModal,
  onOpenAssistantPanel,
}) => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const language = useCurrentLanguage();

  const todayDate = new Date();
  const locale = LOCALE_MAP[language || 'vi'] || 'en-US';
  const todayStr = todayDate.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Time-based greeting helper
  const hour = todayDate.getHours();
  const greetingTime =
    hour < 12
      ? getMultiLangText(language, { vi: 'Buổi sáng tốt lành', en: 'Good Morning', ja: 'おはようございます', ko: '좋은 아침입니다', zh: '早上好', fr: 'Bonjour', de: 'Guten Morgen', es: 'Buenos días' })
      : hour < 18
      ? getMultiLangText(language, { vi: 'Buổi chiều hiệu quả', en: 'Good Afternoon', ja: 'こんにちは', ko: '즐거운 오후입니다', zh: '下午好', fr: 'Bon après-midi', de: 'Guten Tag', es: 'Buenas tardes' })
      : getMultiLangText(language, { vi: 'Buổi tối vui vẻ', en: 'Good Evening', ja: 'こんばんは', ko: '편안한 저녁입니다', zh: '晚上好', fr: 'Bonsoir', de: 'Guten Abend', es: 'Buenas noches' });

  const tasksToday = summary?.tasksToday || 0;
  const eventsCount = summary?.upcomingEvents || 0;
  const tasksDone = summary?.tasksCompletedToday || 0;

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 px-7 py-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08)_0,transparent_32%)]" />
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-indigo-400/15 blur-3xl" />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-white/12 shadow-2xl shadow-black/10 backdrop-blur-md">
            <Sparkles className="h-8 w-8 text-amber-300" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/85 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                {greetingTime}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-indigo-100/80">
                <Clock className="h-3.5 w-3.5" />
                {todayStr}
              </span>
            </div>

            <h1 className="mt-3 max-w-5xl text-2xl font-bold leading-tight tracking-[-0.02em] md:text-3xl">
              {translate(language, 'dashboard.hello')},{' '}
              <span className="text-white/92">{user?.name || translate(language, 'dashboard.userFallback')}</span>{' '}
              <span aria-hidden="true">👋</span>
            </h1>

            <p className="mt-2 max-w-4xl text-sm font-medium leading-6 text-white/80">
              {translate(language, 'dashboard.summaryLine')
                .replace('{events}', String(eventsCount))
                .replace('{tasks}', String(tasksToday))}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
                <CalendarIcon className="h-3.5 w-3.5 text-indigo-200" />
                {getMultiLangText(language, { vi: `${eventsCount} sự kiện 7 ngày tới`, en: `${eventsCount} events in next 7 days`, ja: `今後7日間のイベント ${eventsCount}件`, ko: `향후 7일간 이벤트 ${eventsCount}개`, zh: `未来7天内有 ${eventsCount} 个活动`, fr: `${eventsCount} événements dans les 7 prochains jours`, de: `${eventsCount} Termine in den nächsten 7 Tagen`, es: `${eventsCount} eventos en los próximos 7 días` })}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                {getMultiLangText(language, { vi: `${tasksDone}/${tasksToday} việc hoàn thành`, en: `${tasksDone}/${tasksToday} completed`, ja: `完了 ${tasksDone}/${tasksToday}`, ko: `완료 ${tasksDone}/${tasksToday}`, zh: `已完成 ${tasksDone}/${tasksToday}`, fr: `${tasksDone}/${tasksToday} terminées`, de: `${tasksDone}/${tasksToday} erledigt`, es: `${tasksDone}/${tasksToday} completadas` })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:items-center">
          <button type="button" onClick={onOpenAssistantPanel} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/10 backdrop-blur-md transition hover:bg-white/16">
            <Bot className="h-4 w-4 text-indigo-200" />
            {translate(language, 'dashboard.assistant')}
          </button>
          <button type="button" onClick={onOpenScheduleModal} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:opacity-95">
            <Sparkles className="h-4 w-4 fill-slate-950 text-slate-950" />
            {translate(language, 'dashboard.aiSchedule')}
          </button>
          <button type="button" onClick={() => navigate('/tasks')} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500">
            <Plus className="h-4 w-4" />
            {translate(language, 'dashboard.createTask')}
          </button>
        </div>
      </div>
    </section>
  );
};

