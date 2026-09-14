import React from 'react';
import { Calendar, Clock, Check, Sparkles } from 'lucide-react';
import type { ScheduleSuggestion } from '../types';

export interface ScheduleSuggestionCardProps {
  suggestion: ScheduleSuggestion;
  isSelected: boolean;
  onToggleSelect: (suggestion: ScheduleSuggestion) => void;
}

export const ScheduleSuggestionCard: React.FC<ScheduleSuggestionCardProps> = ({
  suggestion,
  isSelected,
  onToggleSelect,
}) => {
  const startDate = new Date(suggestion.start);
  const endDate = new Date(suggestion.end);

  const dateStr = startDate.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });

  const timeRangeStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(
    startDate.getMinutes()
  ).padStart(2, '0')} – ${String(endDate.getHours()).padStart(2, '0')}:${String(
    endDate.getMinutes()
  ).padStart(2, '0')}`;

  const confidencePct = Math.round(suggestion.confidence * 100);

  return (
    <div
      onClick={() => onToggleSelect(suggestion)}
      className={`flex items-start justify-between gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none ${
        isSelected
          ? 'bg-[#EEF2FF] border-[#4F46E5] shadow-xs'
          : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
            isSelected
              ? 'bg-[#4F46E5] border-[#4F46E5] text-white shadow-2xs'
              : 'border-[#CBD5E1] bg-white'
          }`}
        >
          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-[#131B2E] truncate font-heading">
              {suggestion.taskTitle}
            </h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E2DFFF] text-[#3323CC] inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#4F46E5]" />
              {confidencePct}% độ tin cậy
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-medium text-[#64748B]">
            <span className="flex items-center gap-1 font-semibold text-[#4F46E5]">
              <Calendar className="w-3.5 h-3.5" />
              {dateStr}
            </span>
            <span className="flex items-center gap-1 text-[#131B2E]">
              <Clock className="w-3.5 h-3.5 text-[#64748B]" />
              {timeRangeStr}
            </span>
          </div>

          <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{suggestion.reason}</p>
        </div>
      </div>
    </div>
  );
};
