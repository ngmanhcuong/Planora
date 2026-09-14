import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sparkles, Calendar, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useGenerateSchedule, useApplySchedule } from '../hooks/useAi';
import { ScheduleSuggestionCard } from './ScheduleSuggestionCard';
import type { ScheduleSuggestion } from '../types';

export interface SmartScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartScheduleModal: React.FC<SmartScheduleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextWeekStr);
  const [sessionMinutes, setSessionMinutes] = useState(60);

  const { data: tasksData } = useTasks();
  const incompleteTasks = (tasksData?.tasks || []).filter((t) => t.status !== 'COMPLETED');

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const generateMutation = useGenerateSchedule();
  const applyMutation = useApplySchedule();

  const handleToggleTaskSelect = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSelectAllTasks = () => {
    if (selectedTaskIds.length === incompleteTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(incompleteTasks.map((t) => t.id));
    }
  };

  const handleGenerate = () => {
    const idsToSchedule = selectedTaskIds.length > 0 ? selectedTaskIds : incompleteTasks.map((t) => t.id);
    if (idsToSchedule.length === 0) {
      setErrorMessage('Không có công việc nào chưa hoàn thành để lập lịch.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    generateMutation.mutate(
      {
        taskIds: idsToSchedule,
        startDate,
        endDate,
        preferences: { preferredSessionMinutes: sessionMinutes },
      },
      {
        onSuccess: (data) => {
          setSuggestions(data.suggestions);
          setSelectedSuggestions(data.suggestions); // default select all generated suggestions
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || 'Tính năng AI hiện không khả dụng. Vui lòng thử lại sau.';
          setErrorMessage(msg);
        },
      }
    );
  };

  const handleToggleSuggestionSelect = (sugg: ScheduleSuggestion) => {
    setSelectedSuggestions((prev) => {
      const exists = prev.some((item) => item.taskId === sugg.taskId && item.start === sugg.start);
      if (exists) {
        return prev.filter((item) => !(item.taskId === sugg.taskId && item.start === sugg.start));
      } else {
        return [...prev, sugg];
      }
    });
  };

  const handleApply = () => {
    if (selectedSuggestions.length === 0) return;

    setErrorMessage('');
    const payload = selectedSuggestions.map((s) => ({
      taskId: s.taskId,
      start: s.start,
      end: s.end,
    }));

    applyMutation.mutate(payload, {
      onSuccess: (data) => {
        setSuccessMessage(`Đã thêm thành công ${data.appliedCount} buổi học vào Lịch trình!`);
        setTimeout(() => {
          setSuccessMessage('');
          setSuggestions([]);
          setSelectedSuggestions([]);
          onClose();
        }, 1500);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || 'Đã xảy ra lỗi khi lưu lịch. Vui lòng thử lại.';
        setErrorMessage(msg);
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lập lịch thông minh AI" maxWidth="2xl">
      <div className="flex flex-col gap-5">
        {errorMessage && (
          <div className="p-3 bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl text-xs font-semibold text-[#BA1A1A] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#F43F5E] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-xs font-semibold text-[#047857] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <Input
            label="Từ ngày"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <Input
            label="Đến ngày"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#131B2E]">Thời lượng 1 buổi</label>
            <select
              value={sessionMinutes}
              onChange={(e) => setSessionMinutes(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs font-semibold text-[#131B2E] focus:outline-none focus:border-[#4F46E5]"
            >
              <option value={30}>30 phút</option>
              <option value={60}>60 phút (1 tiếng)</option>
              <option value={90}>90 phút (1.5 tiếng)</option>
              <option value={120}>120 phút (2 tiếng)</option>
            </select>
          </div>
        </div>

        {/* Task Selection Area */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#131B2E] uppercase tracking-wider">
              Chọn công việc cần lập lịch ({incompleteTasks.length})
            </span>
            <button
              onClick={handleSelectAllTasks}
              className="text-xs font-semibold text-[#4F46E5] hover:underline"
            >
              {selectedTaskIds.length === incompleteTasks.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>

          <div className="max-h-40 overflow-y-auto flex flex-col gap-1.5 p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            {incompleteTasks.length === 0 ? (
              <span className="text-xs text-[#64748B] p-2">Chưa có công việc nào cần lập lịch.</span>
            ) : (
              incompleteTasks.map((t) => {
                const isChecked = selectedTaskIds.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#EEF2FF]/50 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleTaskSelect(t.id)}
                        className="rounded text-[#4F46E5] focus:ring-[#4F46E5]"
                      />
                      <span className="font-semibold text-[#131B2E] truncate">{t.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#64748B] shrink-0">
                      Hạn: {new Date(t.dueDate).toLocaleDateString('vi-VN')}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>{generateMutation.isPending ? 'AI đang lập lịch...' : 'Tạo gợi ý lịch học'}</span>
          </Button>
        </div>

        {/* Suggestions Preview List */}
        {suggestions.length > 0 && (
          <div className="flex flex-col gap-3 pt-3 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#131B2E] font-heading">
                Gợi ý từ AI ({suggestions.length} buổi học)
              </span>
              <span className="text-[11px] text-[#64748B]">
                Đã chọn {selectedSuggestions.length} / {suggestions.length}
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto flex flex-col gap-2 pr-1">
              {suggestions.map((sugg, idx) => {
                const isSelected = selectedSuggestions.some(
                  (item) => item.taskId === sugg.taskId && item.start === sugg.start
                );
                return (
                  <ScheduleSuggestionCard
                    key={`${sugg.taskId}_${idx}`}
                    suggestion={sugg}
                    isSelected={isSelected}
                    onToggleSelect={handleToggleSuggestionSelect}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <Button type="button" variant="secondary" onClick={onClose} disabled={applyMutation.isPending}>
                Hủy bỏ
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleApply}
                disabled={applyMutation.isPending || selectedSuggestions.length === 0}
              >
                {applyMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>
                  {applyMutation.isPending
                    ? 'Đang áp dụng...'
                    : `Áp dụng ${selectedSuggestions.length} buổi học`}
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
