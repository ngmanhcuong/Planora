import React, { useState } from 'react';
import { AlertTriangle, Clock, MapPin, BookmarkPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

import { useQuery } from '@tanstack/react-query';
import { calendarApi, type CreateEventPayload } from '../api/calendarApi';
import { apiClient } from '@/lib/axios';
import type { ApiCategory } from '@/types';

export interface CreateEventDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: CreateEventPayload) => Promise<unknown>; initialDate: Date;
  isPending?: boolean;
}

export const CreateEventDrawer: React.FC<CreateEventDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  isPending, initialDate,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(`${initialDate.getFullYear()}-${String(initialDate.getMonth()+1).padStart(2,'0')}-${String(initialDate.getDate()).padStart(2,'0')}`);
  const [error, setError] = useState('');
  const [allowConflict, setAllowConflict] = useState(false);
  const [saving, setSaving] = useState(false);
  const start = new Date(`${date}T${startTime}`);
  const end = new Date(`${date}T${endTime}`);
  const valid = Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && end > start;
  const startAt = valid ? start.toISOString() : '';
  const endAt = valid ? end.toISOString() : '';
  const categories = useQuery({ queryKey: ['event-categories'], queryFn: async () => {
    const response = await apiClient.get('/events/categories');
    return response.data.data.categories as ApiCategory[];
  }});
  const check = useQuery({ queryKey: ['calendar-conflicts', startAt, endAt], enabled: valid,
    queryFn: () => calendarApi.getCalendarRange({start: startAt, end: endAt}) });
  const conflicts = (check.data || []).filter(item => item.sourceType === 'EVENT' && item.end && new Date(item.start) < end && new Date(item.end) > start);
  const close = () => { if (!saving && !isPending) onClose(); };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!valid || title.trim().length < 2) { setError('Nhập tên từ 2 ký tự và giờ kết thúc sau giờ bắt đầu.'); return; }
    setSaving(true);
    try {
      const result = await check.refetch();
      if (result.error || !result.data) throw new Error('Không kiểm tra được lịch. Vui lòng thử lại.');
      if (result.data.some(item => item.sourceType === 'EVENT' && item.end && new Date(item.start) < end && new Date(item.end) > start) && !allowConflict) {
        setError('Lịch bị trùng. Hãy đổi giờ hoặc xác nhận vẫn lưu.'); return;
      }
      await onSave({title: title.trim(), startAt, endAt, categoryId: category || null, location: location.trim() || undefined, description: notes.trim() || undefined});
      onClose();
    } catch { setError('Không thể lưu hoặc kiểm tra lịch. Vui lòng thử lại.'); }
    finally { setSaving(false); }
  };
  return (
    <Modal isOpen={isOpen} onClose={close} title="Thêm lịch trình mới" maxWidth="xl">
    <div className="max-h-[70dvh] overflow-y-auto pr-1 flex flex-col gap-5">
      {/* Form Inputs */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4"><fieldset disabled={saving || isPending} className="flex flex-col gap-4">
        {/* Title Input */}
        <Input
          label="Tên lịch trình"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tên lịch trình..."
          required
        />

        <label className="text-xs font-semibold text-[#131B2E]">Danh mục
          <select className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white p-2" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Không phân loại</option>
            {categories.data?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        {categories.isError && <p role="alert">Không tải được danh mục; có thể lưu không phân loại.</p>}
        {/* Date & Time */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#131B2E]">Thời gian diễn ra</label>
          <Input label="Ngày" type="date" value={date} required onChange={e => {setDate(e.target.value); setAllowConflict(false);}} />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Bắt đầu"
              type="time"
              value={startTime}
              onChange={(e) => {setStartTime(e.target.value); setAllowConflict(false);}}
              rightIcon={<Clock className="w-4 h-4" />}
            />
            <Input
              label="Kết thúc"
              type="time"
              value={endTime}
              onChange={(e) => {setEndTime(e.target.value); setAllowConflict(false);}}
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

        {valid && check.isFetching && <p role="status">Đang kiểm tra lịch đã lưu...</p>}
        {check.isError && <p role="alert">Không tải được lịch để kiểm tra trùng giờ.</p>}
        {conflicts.length > 0 && <div className="bg-[#FFF1F2] text-[#BA1A1A] rounded-lg p-3 text-xs">
          <p className="font-semibold flex gap-2"><AlertTriangle size={16} />Trùng với lịch đã lưu:</p>
          {conflicts.map((item, index) => <p key={`${item.id}-${index}`}>{item.title} · {new Date(item.start).toLocaleString('vi-VN')} – {new Date(item.end!).toLocaleString('vi-VN')}</p>)}
          <label className="flex gap-2 mt-2"><input type="checkbox" checked={allowConflict} onChange={e => setAllowConflict(e.target.checked)} />Vẫn lưu trong khung giờ này</label>
        </div>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
          <Button type="button" variant="secondary" onClick={close} disabled={isPending}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={isPending}>
            <BookmarkPlus className="w-4 h-4" />
            <span>{saving || isPending ? 'Đang lưu...' : 'Lưu lịch trình'}</span>
          </Button>
        </div>
      </fieldset></form>
    </div>
    </Modal>
  );
};
