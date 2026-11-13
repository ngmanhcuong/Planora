import React from 'react';
import { Calendar as CalendarIcon, CheckSquare, Clock, Flame, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';

export interface SummaryMetricsProps {
  summary?: {
    tasksToday: number;
    tasksCompletedToday: number;
    overdueTasks: number;
    upcomingEvents: number;
    habitsCompletedToday: number;
    totalHabits: number;
    unreadNotifications: number;
  };
  productivityScore?: number;
}

export const SummaryMetrics: React.FC<SummaryMetricsProps> = ({ summary, productivityScore = 0 }) => {
  const language = useCurrentLanguage();
  const completedTasks = summary?.tasksCompletedToday || 0;
  const totalTasks = summary?.tasksToday || 0;
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueCount = summary?.overdueTasks || 0;
  const habitsCompleted = summary?.habitsCompletedToday || 0;
  const habitsTotal = summary?.totalHabits || 0;
  const upcomingEventsCount = summary?.upcomingEvents || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Card 1: Today Schedule / Upcoming Events */}
      <div className="group rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {translate(language, 'dashboard.scheduleEvents')}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100 dark:border-blue-800/60 shrink-0">
            <CalendarIcon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2 flex-wrap">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
            {upcomingEventsCount}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            {translate(language, 'dashboard.eventsNext7Days')}
          </span>
        </div>
      </div>

      {/* Card 2: Tasks Progress */}
      <div className="group rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {translate(language, 'dashboard.todayTasks')}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60 shrink-0">
            <CheckSquare className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
              {completedTasks}
              <span className="text-sm sm:text-base font-bold text-slate-400 dark:text-slate-500">/{totalTasks}</span>
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
              {translate(language, 'dashboard.completedPercent').replace('{percent}', String(taskPercent))}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${taskPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 3: Overdue Tasks */}
      <div className={`group rounded-2xl sm:rounded-3xl border bg-white/95 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md dark:bg-slate-900/90 flex flex-col justify-between ${
        overdueCount > 0 ? 'border-rose-300/80 bg-rose-50/30 dark:border-rose-900/50' : 'border-slate-200/80 dark:border-slate-800'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {translate(language, 'dashboard.overdueTasks')}
          </span>
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl border shrink-0 ${
            overdueCount > 0
              ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60'
              : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60'
          }`}>
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2 flex-wrap">
          <span className={`text-2xl sm:text-3xl font-black font-heading ${
            overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
          }`}>
            {overdueCount}
          </span>
          {overdueCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40">
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              {translate(language, 'dashboard.needsAction')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              {translate(language, 'dashboard.noOverdue')}
            </span>
          )}
        </div>
      </div>

      {/* Card 4: Habit Tracker & Productivity */}
      <div className="group rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {translate(language, 'dashboard.habitsScore')}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60 shrink-0">
            <Flame className="h-4 w-4 fill-amber-500" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2 flex-wrap">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
            {habitsCompleted}
            <span className="text-sm sm:text-base font-bold text-slate-400 dark:text-slate-500">/{habitsTotal}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
            <TrendingUp className="w-3 h-3 text-amber-600" />
            {productivityScore}/100
          </span>
        </div>
      </div>
    </div>
  );
};

