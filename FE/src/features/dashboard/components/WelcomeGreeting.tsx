import React from 'react';
import { Plus, Sparkles, Bot, Clock } from 'lucide-react';
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
  return (
    <UserHeroBanner
      icon={Sparkles}
      iconClassName="text-amber-300"
      badge={(
        <>
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          {greetingTime}
        </>
      )}
      badges={(
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-indigo-100/80">
          <Clock className="h-3.5 w-3.5" />
          {todayStr}
        </span>
      )}
      title={(
        <>
          {translate(language, 'dashboard.hello')},{' '}
          <span className="text-white/92">{user?.name || translate(language, 'dashboard.userFallback')}</span>{' '}
          <span aria-hidden="true">👋</span>
        </>
      )}
      subtitle={translate(language, 'dashboard.summaryLine')
        .replace('{events}', String(eventsCount))
        .replace('{tasks}', String(tasksToday))}
      actions={(
        <>
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
        </>
      )}
    />
  );
};

