import React from 'react';
import { Calendar as CalendarIcon, CheckSquare, Clock, Flame, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';

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
  const completedTasks = summary?.tasksCompletedToday || 0;
  const totalTasks = summary?.tasksToday || 0;
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueCount = summary?.overdueTasks || 0;
  const habitsCompleted = summary?.habitsCompletedToday || 0;
  const habitsTotal = summary?.totalHabits || 0;
  const upcomingEventsCount = summary?.upcomingEvents || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Card 1: Today Schedule / Upcoming Events */}
      <Card padding="md" className="flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#464555]">Lịch trình & Sự kiện</span>
          <div className="w-8 h-8 rounded-lg bg-[#D8E2FF] flex items-center justify-center text-[#001A42]">
            <CalendarIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-[#131B2E] font-heading">
            {upcomingEventsCount}
          </span>
          <span className="text-[11px] text-[#464555] flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2170E4]" />
            Sự kiện trong 7 ngày tới
          </span>
        </div>
      </Card>

      {/* Card 2: Tasks Progress */}
      <Card padding="md" className="flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#464555]">Công việc hôm nay</span>
          <div className="w-8 h-8 rounded-lg bg-[#E2DFFF] flex items-center justify-center text-[#3525CD]">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#131B2E] font-heading">
              {completedTasks}
              <span className="text-lg font-normal text-[#464555]">/{totalTasks}</span>
            </span>
            <span className="text-xs text-[#464555] font-medium">{taskPercent}% hoàn thành</span>
          </div>
          <div className="w-full h-1.5 bg-[#E2E7FF] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4F46E5] rounded-full transition-all duration-300"
              style={{ width: `${taskPercent}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Card 3: Overdue Tasks */}
      <Card padding="md" className="flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#464555]">Công việc quá hạn</span>
          <div className="w-8 h-8 rounded-lg bg-[#FFDAD6] flex items-center justify-center text-[#BA1A1A]">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-[#BA1A1A] font-heading">
            {overdueCount}
          </span>
          <span className="text-[11px] text-[#BA1A1A] flex items-center gap-1 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            {overdueCount > 0 ? 'Cần xử lý ngay' : 'Không có việc quá hạn'}
          </span>
        </div>
      </Card>

      {/* Card 4: Habit Tracker & Productivity */}
      <Card padding="md" className="flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#464555]">Thói quen & Điểm Năng suất</span>
          <div className="w-8 h-8 rounded-lg bg-[#6FFBBE] flex items-center justify-center text-[#002113]">
            <Flame className="w-4 h-4 text-[#005338]" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-[#131B2E] font-heading">
            {habitsCompleted}
            <span className="text-lg font-normal text-[#464555]">/{habitsTotal}</span>
          </span>
          <span className="text-[11px] text-[#005338] flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            Điểm: {productivityScore}/100
          </span>
        </div>
      </Card>
    </div>
  );
};
