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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {/* Card 1: Today Schedule / Upcoming Events */}
      <div className="group relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {translate(language, 'dashboard.scheduleEvents')}
          </span>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
              {upcomingEventsCount}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              {translate(language, 'dashboard.eventsNext7Days')}
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Tasks Progress */}
      <div className="group relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-600" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {translate(language, 'dashboard.todayTasks')}
          </span>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
              {completedTasks}
              <span className="text-lg font-semibold text-slate-400">/{totalTasks}</span>
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
              {translate(language, 'dashboard.completedPercent').replace('{percent}', String(taskPercent))}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500"
              style={{ width: `${taskPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 3: Overdue Tasks */}
      <div className={`group relative overflow-hidden rounded-2xl bg-white p-5 border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-4 ${
        overdueCount > 0 ? 'border-red-200 bg-red-50/20' : 'border-slate-200/80'
      }`}>
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          overdueCount > 0 ? 'from-rose-500 to-red-600' : 'from-emerald-400 to-teal-500'
        }`} />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {translate(language, 'dashboard.overdueTasks')}
          </span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform bg-gradient-to-br ${
            overdueCount > 0 ? 'from-rose-500 to-red-600 shadow-rose-500/20' : 'from-emerald-500 to-teal-600 shadow-emerald-500/20'
          }`}>
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl sm:text-4xl font-black font-heading ${
              overdueCount > 0 ? 'text-red-600' : 'text-slate-900'
            }`}>
              {overdueCount}
            </span>
            {overdueCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                {translate(language, 'dashboard.needsAction')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {translate(language, 'dashboard.noOverdue')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card 4: Habit Tracker & Productivity */}
      <div className="group relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {translate(language, 'dashboard.habitsScore')}
          </span>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform">
            <Flame className="w-5 h-5 fill-slate-950" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
              {habitsCompleted}
              <span className="text-lg font-semibold text-slate-400">/{habitsTotal}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              {translate(language, 'dashboard.score')}: {productivityScore}/100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

