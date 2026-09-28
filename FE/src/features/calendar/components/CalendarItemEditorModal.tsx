import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock, MapPin, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TimePicker } from '@/components/ui/TimePicker';
import type { CreateEventPayload, UpdateEventPayload } from '../api/calendarApi';
import type { CalendarEventItem } from '../types';
import type { UpdateTaskPayload } from '@/features/tasks/api/tasksApi';

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
  const [location, setLocation] = useState('');
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
    setLocation(event.location ?? '');
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
          dueDate: start.toISOString(),
          dueTime: startTime,
        });
      } else {
        const payload = {
          title: title.trim(),
          location: location.trim() || undefined,
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

        {event.sourceType !== 'TASK' && (
          <Input
            label="Địa điểm"
            value={location}
            onChange={(changeEvent) => setLocation(changeEvent.target.value)}
            leftIcon={<MapPin className="h-4 w-4" />}
            placeholder="Phòng học / địa điểm..."
          />
        )}

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

