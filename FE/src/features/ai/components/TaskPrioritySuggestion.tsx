import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { usePrioritizeTasks } from '../hooks/useAi';
import type { TaskPriorityRecommendation } from '../types';

export interface TaskPrioritySuggestionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskPrioritySuggestion: React.FC<TaskPrioritySuggestionProps> = ({
  isOpen,
  onClose,
}) => {
  const [recommendations, setRecommendations] = useState<TaskPriorityRecommendation[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const prioritizeMutation = usePrioritizeTasks();

  const handleFetchPriorities = () => {
    setErrorMessage('');
    prioritizeMutation.mutate(undefined, {
      onSuccess: (data) => {
        setRecommendations(data.recommendations);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || 'Tính năng AI hiện không khả dụng. Vui lòng thử lại sau.';
        setErrorMessage(msg);
      },
    });
  };

  const priorityStyles: Record<string, { bg: string; text: string; label: string }> = {
    URGENT: { bg: '#FFDAD6', text: '#93000A', label: 'Khẩn cấp' },
    HIGH: { bg: '#FFDAD6', text: '#93000A', label: 'Gấp' },
    MEDIUM: { bg: '#E2DFFF', text: '#3323CC', label: 'Trung bình' },
    LOW: { bg: '#D7E8CD', text: '#002113', label: 'Thấp' },
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gợi ý thứ tự ưu tiên AI" maxWidth="lg">
      <div className="flex flex-col gap-4">
        {errorMessage && (
          <div className="p-3 bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl text-xs font-semibold text-[#BA1A1A]">
            {errorMessage}
          </div>
        )}

        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-bold text-[#131B2E]">Phân tích công việc bằng AI</h4>
              <p className="text-xs text-[#64748B] max-w-sm">
                AI sẽ đánh giá hạn chót, mức độ khẩn cấp và lịch trình để đề xuất thứ tự công việc nên làm trước.
              </p>
            </div>

            <Button type="button" variant="primary" onClick={handleFetchPriorities} disabled={prioritizeMutation.isPending}>
              {prioritizeMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              <span>{prioritizeMutation.isPending ? 'Đang phân tích...' : 'Phân tích thứ tự ưu tiên'}</span>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#131B2E] uppercase tracking-wider">
                Thứ tự đề xuất ({recommendations.length} công việc)
              </span>
              <button
                onClick={handleFetchPriorities}
                disabled={prioritizeMutation.isPending}
                className="text-xs font-semibold text-[#4F46E5] hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Phân tích lại
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto flex flex-col gap-2 pr-1">
              {recommendations.map((rec) => {
                const style = priorityStyles[rec.suggestedPriority] || priorityStyles.MEDIUM;
                return (
                  <div
                    key={rec.taskId}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        #{rec.rank}
                      </div>

                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: style.bg, color: style.text }}
                          >
                            {style.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] leading-relaxed">{rec.reason}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-[#EEF2FF]/60 rounded-xl border border-[#E2E8F0] text-xs text-[#4F46E5] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Gợi ý trên có tính chất tham khảo và không tự động thay đổi dữ liệu công việc.</span>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
