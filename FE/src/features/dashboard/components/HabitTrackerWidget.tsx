import React from 'react';
import { Flame, Check, Sparkles } from 'lucide-react';
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
    <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Flame className="w-4 h-4 fill-amber-500" />
          </div>
          <h2 className="text-base font-bold text-slate-900 font-heading">
            {translate(language, 'dashboard.todayHabits')}
          </h2>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
          {completedCount} / {habits.length} {translate(language, 'dashboard.completed')}
        </span>
      </div>

      {/* Habits List */}
      <div className="flex flex-col gap-3">
        {habits.length === 0 ? (
          <div className="py-6 px-4 rounded-xl bg-slate-50/70 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <p className="text-xs font-bold text-slate-700">
              {translate(language, 'dashboard.noHabits')}
            </p>
            <p className="text-[11px] text-slate-500">
              Thiết lập thói quen hằng ngày để rèn luyện tính kỷ luật và tăng điểm năng suất!
            </p>
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
                    ? 'bg-emerald-50/60 border-emerald-200/80'
                    : 'bg-white border-slate-200/80 hover:border-amber-200 hover:shadow-xs'
                }`}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">{title}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-2xs">
                      <Flame className="w-3 h-3 fill-slate-950" /> {streak} ngày
                    </span>
                  </div>
                  {habit.description && (
                    <span className="text-[11px] text-slate-500">{habit.description}</span>
                  )}
                </div>

                <button
                  onClick={() => toggleCheckIn(habit)}
                  disabled={isPending}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700'
                  }`}
                >
                  {isDone ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      {translate(language, 'dashboard.done')}
                    </>
                  ) : (
                    'Điểm danh'
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

