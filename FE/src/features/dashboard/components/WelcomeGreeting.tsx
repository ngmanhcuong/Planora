import React from 'react';
import { Plus, Sparkles, Bot, Calendar as CalendarIcon, CheckCircle2, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';

export interface WelcomeGreetingProps {
  summary?: {
    tasksToday: number;
    tasksCompletedToday: number;
    upcomingEvents: number;
  };
  onOpenScheduleModal?: () => void;
  onOpenAssistantPanel?: () => void;
}

export const WelcomeGreeting: React.FC<WelcomeGreetingProps> = ({
  summary,
  onOpenScheduleModal,
  onOpenAssistantPanel,
}) => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const language = useCurrentLanguage();

  const todayDate = new Date();
  const todayStr = todayDate.toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Time-based greeting helper
  const hour = todayDate.getHours();
  const greetingTime =
    hour < 12
      ? language === 'en'
        ? 'Good Morning'
        : 'Buổi sáng tốt lành'
      : hour < 18
      ? language === 'en'
        ? 'Good Afternoon'
        : 'Buổi chiều hiệu quả'
      : language === 'en'
      ? 'Good Evening'
      : 'Buổi tối vui vẻ';

  const tasksToday = summary?.tasksToday || 0;
  const eventsCount = summary?.upcomingEvents || 0;
  const tasksDone = summary?.tasksCompletedToday || 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20 border border-indigo-800/40">
      {/* Decorative Glowing Ambient Spheres */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

      {/* Grid subtle texture overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Greeting & Stats info */}
        <div className="flex flex-col gap-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 border border-white/15 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{greetingTime}</span>
            </span>
            <span className="text-xs text-indigo-300/80 font-medium">
              <Clock className="w-3 h-3 inline mr-1" />
              {todayStr}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading text-white leading-tight">
            {translate(language, 'dashboard.hello')},{' '}
            <span className="bg-gradient-to-r from-indigo-200 via-white to-blue-200 bg-clip-text text-transparent">
              {user?.name || translate(language, 'dashboard.userFallback')}
            </span>{' '}
            👋
          </h1>

          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-medium">
            {translate(language, 'dashboard.summaryLine')
              .replace('{events}', String(eventsCount))
              .replace('{tasks}', String(tasksToday))}
          </p>

          {/* Quick Badges Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-300" />
              <span>{eventsCount} sự kiện 7 ngày tới</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{tasksDone}/{tasksToday} việc hoàn thành</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive AI & Quick Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={onOpenAssistantPanel}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-bold text-white backdrop-blur-md shadow-lg shadow-black/10 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Bot className="w-4 h-4 text-indigo-300" />
            <span>{translate(language, 'dashboard.assistant')}</span>
          </button>

          <button
            onClick={onOpenScheduleModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-xs sm:text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:opacity-95 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>{translate(language, 'dashboard.aiSchedule')}</span>
          </button>

          <button
            onClick={() => navigate('/tasks')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{translate(language, 'dashboard.createTask')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

