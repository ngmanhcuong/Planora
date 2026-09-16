import React from 'react';
import { Flame, Check, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ApiHabit } from '@/types';
import { useCheckInHabit, useUndoCheckInHabit } from '../hooks/useHabits';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';

export interface HabitTrackerWidgetProps {
  habits?: ApiHabit[];
}

export const HabitTrackerWidget: React.FC<HabitTrackerWidgetProps> = ({ habits = [] }) => {
  const language = useCurrentLanguage();
  const checkInMutation = useCheckInHabit();
  const undoMutation = useUndoCheckInHabit();

  const completedCount = habits.filter((h) => h.completedToday || h.isCompletedToday).length;

  const toggleCheckIn = (habit: ApiHabit) => {
    const isCompleted = habit.completedToday || habit.isCompletedToday;
    if (isCompleted) {
      undoMutation.mutate({ id: habit.id });
    } else {
      checkInMutation.mutate({ id: habit.id });
    }
  };

  const isPending = checkInMutation.isPending || undoMutation.isPending;

  return (
    <Card padding="lg" className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h2 className="text-base font-bold text-[#131B2E] font-heading">{translate(language, 'dashboard.todayHabits')}</h2>
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
        </div>
        <span className="text-xs font-bold text-[#10B981]">
          {completedCount} / {habits.length} {translate(language, 'dashboard.completed')}
        </span>
      </div>

      {/* Habits List */}
      <div className="flex flex-col gap-3">
        {habits.length === 0 ? (
          <div className="py-4 text-center text-xs text-[#64748B]">
            {translate(language, 'dashboard.noHabits')}
          </div>
        ) : (
          habits.map((habit) => {
            const isDone = habit.completedToday || habit.isCompletedToday;
            const title = habit.title || (habit as any).name || translate(language, 'dashboard.habitFallback');
            const streak = habit.currentStreak || 0;

            return (
              <div
                key={habit.id}
                className={`p-3.5 rounded-xl flex items-center justify-between gap-3 border transition-all ${
                  isDone
                    ? 'bg-[#ECFDF5] border-[#D1FAE5]'
                    : 'bg-white border-[#E2E8F0] shadow-2xs'
                }`}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#131B2E] truncate">{title}</span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#6FFBBE] text-[#002113]">
                      <Flame className="w-3 h-3 text-[#005338]" /> {streak}d
                    </span>
                  </div>
                  {habit.description && (
                    <span className="text-[11px] text-[#64748B]">{habit.description}</span>
                  )}
                </div>

                <Button
                  size="sm"
                  variant={isDone ? 'primary' : 'secondary'}
                  onClick={() => toggleCheckIn(habit)}
                  disabled={isPending}
                  className={
                    isDone
                      ? 'bg-[#10B981] hover:bg-[#059669] text-white shrink-0 h-8 text-xs cursor-pointer'
                      : 'shrink-0 h-8 text-xs hover:bg-[#4F46E5] hover:text-white cursor-pointer'
                  }
                >
                  {isDone ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      {translate(language, 'dashboard.done')}
                    </>
                  ) : (
                    'Check-in'
                  )}
                </Button>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
