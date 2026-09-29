import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TimePicker } from '@/components/ui/TimePicker';
import { Select } from '@/components/ui/Select';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import type { CreateEventPayload, UpdateEventPayload } from '../api/calendarApi';
import type { CalendarEventItem } from '../types';
import type { UpdateTaskPayload } from '@/features/tasks/api/tasksApi';
import type { ApiCategory } from '@/types';

interface CalendarItemEditorModalProps {
  event: CalendarEventItem | null;
  isOpen: boolean;
  isPending?: boolean;
  onClose: () => void;
  onSaveEvent: (event: CalendarEventItem, data: UpdateEventPayload) => Promise<unknown>;
  onSaveTask: (event: CalendarEventItem, data: UpdateTaskPayload) => Promise<unknown>;
  onSaveTimetable: (event: CalendarEventItem, data: CreateEventPayload) => Promise<unknown>;
}

const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeValue = (date: Date) => {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const parseEventDate = (value?: string | null) => {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const combineDateAndTime = (date: string, time: string) => new Date(`${date}T${time}`);

export const CalendarItemEditorModal: React.FC<CalendarItemEditorModalProps> = ({
  event,
  isOpen,
  isPending,
  onClose,
  onSaveEvent,
  onSaveTask,
  onSaveTimetable,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [courseCode, setCourseCode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(formatDateValue(new Date()));
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!event || !isOpen) return;

    const start = parseEventDate(event.startAt);
    const end = event.endAt ? parseEventDate(event.endAt) : new Date(start.getTime() + 60 * 60 * 1000);
    setTitle(event.title);
    setDescription(event.description ?? event.notes ?? '');
    setPriority((event.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') || 'MEDIUM');
    setCourseCode(event.courseCode ?? '');
    setCategoryId(event.categoryId ?? '');
    setDate(formatDateValue(start));
    setStartTime(formatTimeValue(start));
    setEndTime(formatTimeValue(end));
    setError('');
    setSaving(false);
  }, [event, isOpen]);

  const modeLabel = useMemo(() => {
    if (event?.sourceType === 'TASK') return 'công việc';
    if (event?.sourceType === 'TIMETABLE') return 'lịch cố định';
    return 'lịch trình';
  }, [event?.sourceType]);

  const categories = useQuery({
    queryKey: ['event-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/events/categories');
      return response.data.data.categories as ApiCategory[];
    },
    enabled: isOpen && Boolean(event),
  });
  const categoryOptions = [
    { value: '', label: 'Không phân loại', color: '#94A3B8' },
    ...(categories.data?.map((item) => ({
      value: item.id,
      label: item.name,
      color: item.color || '#6366F1',
    })) || []),
  ];

  if (!event) return null;

  const start = combineDateAndTime(date, startTime);
  const end = combineDateAndTime(date, endTime);
  const isValidTime = Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && end > start;
  const isSubmitting = Boolean(isPending || saving);

  const handleSubmit = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();
    setError('');

    if (title.trim().length < 2) {
      setError('Tên cần ít nhất 2 ký tự.');
      return;
    }

    if (!isValidTime) {
      setError('Giờ kết thúc phải sau giờ bắt đầu.');
      return;
    }

    setSaving(true);
    try {
      if (event.sourceType === 'TASK') {
        await onSaveTask(event, {
          title: title.trim(),
          description: description.trim() || null,
          priority,
          categoryId: categoryId || null,
          courseCode: courseCode.trim() || null,
          dueDate: start.toISOString(),
          dueTime: startTime,
        });
      } else {
        const payload = {
          title: title.trim(),
          description: description.trim() || undefined,
          startAt: start.toISOString(),
          endAt: end.toISOString(),
          allDay: false,
          color: event.color,
        } satisfies CreateEventPayload;

        if (event.sourceType === 'TIMETABLE') {
          await onSaveTimetable(event, payload);
        } else {
          await onSaveEvent(event, payload satisfies UpdateEventPayload);
        }
      }
      onClose();
    } catch {
      setError('Không thể lưu thay đổi. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Chỉnh sửa ${modeLabel}`} maxWidth="xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Tên"
          value={title}
          onChange={(changeEvent) => setTitle(changeEvent.target.value)}
          placeholder="Nhập tên..."
          required
        />

        {event.sourceType === 'TASK' && (
          <Select
            label="Danh mục"
            value={categoryId}
            onChange={setCategoryId}
            options={categoryOptions}
          />
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <DatePicker
            label="Ngày"
            value={date}
            required
            onChange={setDate}
          />
          <TimePicker
            label="Bắt đầu"
            value={startTime}
            required
            align="left"
            onChange={setStartTime}
          />
          <TimePicker
            label="Kết thúc"
            value={endTime}
            required
            align="right"
            onChange={setEndTime}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Ghi chú chi tiết
          </label>
          <textarea
            value={description}
            onChange={(changeEvent) => setDescription(changeEvent.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-400 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
            placeholder="Thêm mô tả hoặc tài liệu cần làm..."
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-indigo-500" />
            <span>{date}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500" />
            <span>{startTime} - {endTime}</span>
          </div>
        </div>

        {error && <p role="alert" className="text-sm font-semibold text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            <Save className="h-4 w-4" />
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
};

