import React, { useState } from 'react';
import { WelcomeGreeting } from './components/WelcomeGreeting';
import { SummaryMetrics } from './components/SummaryMetrics';
import { TodayTimeline } from './components/TodayTimeline';
import { PriorityTasksWidget } from './components/PriorityTasksWidget';
import { HabitTrackerWidget } from './components/HabitTrackerWidget';
import { TomorrowPreviewWidget } from './components/TomorrowPreviewWidget';
import { useDashboard } from './hooks/useDashboard';
import { SmartScheduleModal, AiAssistantPanel } from '@/features/ai';
import { Loader2 } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { data: dashboardData, isLoading, isError } = useDashboard();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="p-6 text-center text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
        Không thể tải dữ liệu Tổng quan. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-6">
      {/* 1. Header Greeting Banner */}
      <WelcomeGreeting
        summary={dashboardData.summary}
        onOpenScheduleModal={() => setIsScheduleOpen(true)}
        onOpenAssistantPanel={() => setIsAssistantOpen(true)}
      />

      {/* 2. 4 Summary Metric Cards */}
      <SummaryMetrics
        summary={dashboardData.summary}
        productivityScore={dashboardData.productivity?.todayScore}
      />

      {/* 3. Main Content Layout (7:5 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Timeline Schedule (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <TodayTimeline
            timetableToday={dashboardData.timetable?.today}
            eventsToday={dashboardData.events?.upcoming}
          />
        </div>

        {/* Right Column: Priority Tasks & Habit Status & Upcoming (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <PriorityTasksWidget
            tasks={dashboardData.tasks?.today}
            overdueTasks={dashboardData.tasks?.overdue}
          />
          <HabitTrackerWidget habits={dashboardData.habits?.today} />
          <TomorrowPreviewWidget events={dashboardData.events?.upcoming} />
        </div>
      </div>

      <SmartScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
      />

      <AiAssistantPanel
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
};

