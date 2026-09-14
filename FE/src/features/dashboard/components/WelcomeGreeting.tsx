import React from 'react';
import { Plus, Sparkles, Bot } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

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

  const todayStr = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const tasksToday = summary?.tasksToday || 0;
  const eventsCount = summary?.upcomingEvents || 0;

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#131B2E] tracking-tight font-heading">
          Xin chào, {user?.name || 'Người dùng'} 👋
        </h1>
        <p className="text-xs sm:text-sm text-[#464555] flex flex-wrap items-center gap-2">
          <span className="font-medium text-[#131B2E]">Hôm nay, {todayStr}</span>
          <span className="w-1 h-1 rounded-full bg-[#777587]" />
          <span>Bạn có {eventsCount} sự kiện sắp tới và {tasksToday} công việc cần thực hiện hôm nay.</span>
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <button
          onClick={onOpenAssistantPanel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF2FF] border border-[#E2DFFF] text-xs font-bold text-[#4F46E5] hover:bg-[#E2DFFF] transition-all cursor-pointer shadow-2xs"
        >
          <Bot className="w-4 h-4 text-[#4F46E5]" />
          <span>Trợ lý AI</span>
        </button>

        <button
          onClick={onOpenScheduleModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#3B82F6] text-xs font-bold text-white hover:opacity-95 transition-all cursor-pointer shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>Lập lịch AI</span>
        </button>

        <Button variant="secondary" size="sm" onClick={() => navigate('/tasks')} className="cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Tạo công việc</span>
        </Button>
      </div>
    </div>
  );
};

