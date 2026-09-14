import React, { useState } from 'react';
import { X, AlertTriangle, Calendar, Clock, MapPin, BookmarkPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { CategoryType } from '@/types';
import { CATEGORY_MAP } from '@/utils/categories';

export interface CreateEventDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (eventData: any) => void;
  isPending?: boolean;
}

export const CreateEventDrawer: React.FC<CreateEventDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  isPending,
}) => {
  const [title, setTitle] = useState('Họp bổ sung đồ án tốt nghiệp');
  const [category, setCategory] = useState<CategoryType>('meeting');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [location, setLocation] = useState('Phòng họp trực tuyến Google Meet');
  const [notes, setNotes] = useState('Thảo luận về module Database & Timeline bàn giao sprint 4.');
  const [showConflictWarning, setShowConflictWarning] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.({
      title,
      category,
      startTime,
      endTime,
      location,
      notes,
    });
    onClose();
  };

  return (
    <div className="w-full xl:w-[410px] shrink-0 bg-white rounded-xl border border-[#E2E8F0] shadow-md p-6 flex flex-col gap-5 animate-in slide-in-from-right-4 duration-200">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
          <h2 className="text-base font-bold text-[#131B2E] font-heading">Thêm lịch trình mới</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#131B2E] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Schedule Conflict Warning Callout */}
      {showConflictWarning && (
        <div className="p-4 rounded-xl bg-[#FFF1F2] border border-[#FFE4E6] text-[#131B2E] flex flex-col gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#F43F5E] shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#93000A]">Phát hiện xung đột lịch trình</span>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                Khung giờ này đang trùng với{' '}
                <span className="font-semibold text-[#131B2E] underline decoration-[#F43F5E] underline-offset-2">
                  "Họp nhóm đồ án"
                </span>{' '}
                từ 14:00 – 15:30.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setStartTime('16:00');
                setEndTime('17:00');
                setShowConflictWarning(false);
              }}
              className="px-2.5 py-1 rounded-md bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#131B2E] transition-colors"
            >
              Gợi ý giờ khác
            </button>
            <button
              type="button"
              onClick={() => setShowConflictWarning(false)}
              className="px-2.5 py-1 rounded-md bg-[#FFDAD6] text-[#93000A] hover:bg-[#F43F5E] hover:text-white text-xs font-semibold transition-colors"
            >
              Vẫn giữ giờ này
            </button>
          </div>
        </div>
      )}

      {/* Form Inputs */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title Input */}
        <Input
          label="Tên lịch trình"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tên lịch trình..."
          required
        />

        {/* Category Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#131B2E]">Phân loại danh mục</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['study', 'work', 'meeting', 'personal', 'habit'] as CategoryType[]).map((cat) => {
              const info = CATEGORY_MAP[cat];
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all border ${
                    isSelected
                      ? 'bg-[#4F46E5] text-white border-[#4F46E5] font-semibold shadow-xs'
                      : 'bg-[#F8FAFC] text-[#464555] border-[#E2E8F0] hover:bg-[#EEF2FF]'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: isSelected ? '#FFFFFF' : info.color }}
                  />
                  <span>{info.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#131B2E]">Thời gian diễn ra</label>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#131B2E]">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#64748B]" />
              Thứ Hai, 14/09/2026
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Bắt đầu"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              rightIcon={<Clock className="w-4 h-4" />}
            />
            <Input
              label="Kết thúc"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              rightIcon={<Clock className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Location */}
        <Input
          label="Địa điểm / Nền tảng"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          leftIcon={<MapPin className="w-4 h-4" />}
          placeholder="Phòng học / Link Google Meet..."
        />

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#131B2E]">Ghi chú chi tiết</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#131B2E] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 resize-none transition-all"
            placeholder="Thêm mô tả hoặc tài liệu cần làm..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={isPending}>
            <BookmarkPlus className="w-4 h-4" />
            <span>{isPending ? 'Đang lưu...' : 'Lưu lịch trình'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
