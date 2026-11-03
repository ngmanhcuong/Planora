import React from 'react';
import { Plus, Sparkles, Bot, Clock, LayoutGrid } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, getMultiLangText } from '@/lib/i18n';
import { UserHeroBanner } from '@/components/ui/UserHeroBanner';

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
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Time-based greeting helper
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
          vi: 'Buổi chiều hiệu quả',
          en: 'Good Afternoon',
          ja: 'こんにちは',
          ko: '즐거운 오후입니다',
          zh: '下午好',
          fr: 'Bon après-midi',
          de: 'Guten Tag',
          es: 'Buenas tardes',
        })
      : getMultiLangText(language, {
          vi: 'Buổi tối vui vẻ',
          en: 'Good Evening',
          ja: 'こんばんは',
          ko: '편안한 저녁입니다',
          zh: '晚上好',
          fr: 'Bonsoir',
          de: 'Guten Abend',
          es: 'Buenas noches',
        });

  const tasksToday = summary?.tasksToday || 0;
  const eventsCount = summary?.upcomingEvents || 0;

  return (
    <UserHeroBanner
      tone="dashboard"
      icon={LayoutGrid}
      badge={greetingTime}
      badges={(
        <>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md shadow-xs">
            <Clock className="h-3.5 w-3.5 text-indigo-300" />
            {todayStr}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300 backdrop-blur-md shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {getMultiLangText(language, { vi: 'Hôm nay', en: 'Today', ja: '今日', ko: '오늘', zh: '今天', fr: "Aujourd'hui", de: 'Heute', es: 'Hoy' })}
          </span>
        </>
      )}
      title={(
        <>
          {translate(language, 'dashboard.hello')},{' '}
          <span className="text-white font-extrabold">{user?.name || translate(language, 'dashboard.userFallback')}</span>{' '}
          <span aria-hidden="true" className="inline-block animate-wave origin-[70%_70%]">👋</span>
        </>
      )}
      subtitle={translate(language, 'dashboard.summaryLine')
        .replace('{events}', String(eventsCount))
        .replace('{tasks}', String(tasksToday))}
      actions={(
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenAssistantPanel}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-white/15 bg-white/10 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm backdrop-blur-md transition-all hover:bg-white/18 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Bot className="h-4 w-4 text-indigo-200" />
            <span>{translate(language, 'dashboard.assistant')}</span>
          </button>
          <button
            type="button"
            onClick={onOpenScheduleModal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:brightness-105 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="h-4 w-4 fill-slate-950 text-slate-950" />
            <span>{translate(language, 'dashboard.aiSchedule')}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>{translate(language, 'dashboard.createTask')}</span>
          </button>
        </div>
      )}
    />
  );
};
