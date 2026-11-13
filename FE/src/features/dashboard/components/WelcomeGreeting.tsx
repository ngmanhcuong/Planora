import React from 'react';
import { Plus, Sparkles, Bot, Calendar, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
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
}

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
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const hour = todayDate.getHours();
  const greetingTime =
    hour < 12
      ? getMultiLangText(language, {
          vi: 'Buổi sáng tốt lành',
          en: 'Good Morning',
          ja: 'おはようございます',
          ko: '좋은 아침입니다',
          zh: '早上好',
          fr: 'Bonjour',
          de: 'Guten Morgen',
          es: 'Buenos días',
        })
      : hour < 18
      ? getMultiLangText(language, {
          vi: 'Buổi chiều năng suất',
          en: 'Good Afternoon',
          ja: 'こんにちは',
          ko: '즐거운 오후입니다',
          zh: '下午好',
          fr: 'Bon après-midi',
          de: 'Guten Tag',
          es: 'Buenas tardes',
        })
      : getMultiLangText(language, {
          vi: 'Buổi tối thư giãn',
          en: 'Good Evening',
          ja: 'こんばんは',
          ko: '편안한 저녁입니다',
          zh: '晚上好',
          fr: 'Bonsoir',
          de: 'Guten Abend',
          es: 'Buenas noches',
        });

  const tasksToday = summary?.tasksToday || 0;
  const tasksCompleted = summary?.tasksCompletedToday || 0;
  const eventsCount = summary?.upcomingEvents || 0;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20">
      {/* Decorative Glow Elements */}
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:radial-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:18px_18px]" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Column: Greeting & Info */}
        <div className="flex-1 space-y-3">
          {/* Top Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              {greetingTime}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md">
              <Clock className="h-3.5 w-3.5 text-indigo-200" />
              {todayStr}
            </span>
          </div>

          {/* User Name & Greeting */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-heading">
            {translate(language, 'dashboard.hello')},{' '}
            <span className="text-white drop-shadow-xs">{user?.name || translate(language, 'dashboard.userFallback')}</span>{' '}
            <span aria-hidden="true" className="inline-block animate-wave origin-[70%_70%]">👋</span>
          </h1>

          {/* Quick Metrics Pills */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md border border-white/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <span>
                {tasksCompleted}/{tasksToday} {getMultiLangText(language, { vi: 'việc hoàn thành', en: 'tasks done' })}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md border border-white/10">
              <Calendar className="h-4 w-4 text-sky-300" />
              <span>
                {eventsCount} {getMultiLangText(language, { vi: 'sự kiện sắp tới', en: 'upcoming events' })}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Prominent Quick Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenAssistantPanel}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-sm backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Bot className="h-4 w-4 text-indigo-200" />
            <span>{translate(language, 'dashboard.assistant')}</span>
          </button>

          <button
            type="button"
            onClick={onOpenScheduleModal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-4 py-3 text-xs sm:text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:brightness-105 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="h-4 w-4 fill-slate-950 text-slate-950" />
            <span>{translate(language, 'dashboard.aiSchedule')}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="w-full sm:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs sm:text-sm font-extrabold text-indigo-900 shadow-lg shadow-black/10 transition-all hover:bg-slate-50 active:scale-95 cursor-pointer whitespace-nowrap group"
          >
            <Plus className="h-4 w-4 text-indigo-600 transition-transform group-hover:rotate-90 duration-200" />
            <span>{translate(language, 'dashboard.createTask')}</span>
            <ArrowRight className="h-3.5 w-3.5 text-indigo-500 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
