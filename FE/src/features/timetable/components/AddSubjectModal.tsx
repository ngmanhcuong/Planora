import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookOpen, MapPin, User, BookmarkPlus, ChevronDown, Check, Clock } from 'lucide-react';
import type { TimetableClassItem } from '../types';
import { defaultEndTime } from '../utils/timetableTime';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate, type TranslationKey } from '@/lib/i18n';

export interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClass: (cls: Omit<TimetableClassItem, 'id'>) => void;
  initialDayIndex?: number;
  initialStartTime?: string;
}

const WEEKDAY_KEYS: TranslationKey[] = [
  'weekday.mon',
  'weekday.tue',
  'weekday.wed',
  'weekday.thu',
  'weekday.fri',
  'weekday.sat',
  'weekday.sun',
];

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onAddClass,
  initialDayIndex,
  initialStartTime,
}) => {
  const language = useCurrentLanguage();
  const [subjectName, setSubjectName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [dayIndex, setDayIndex] = useState<number>(0);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [room, setRoom] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [type, setType] = useState<'theory' | 'practice' | 'exam'>('theory');
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [timeError, setTimeError] = useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    if (typeof initialDayIndex === 'number') setDayIndex(initialDayIndex);
    if (initialStartTime) {
      setStartTime(initialStartTime);
      setEndTime(defaultEndTime(initialStartTime, 60));
    }
  }, [isOpen, initialDayIndex, initialStartTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    if (endTime <= startTime) {
      setTimeError(translate(language, 'timetable.timeInvalid'));
      return;
    }
    setTimeError('');

    const typeLabelMap = {
      theory: translate(language, 'timetable.type.theory'),
      practice: translate(language, 'timetable.type.practice'),
      exam: translate(language, 'timetable.type.exam'),
    };

    onAddClass({
      subjectName,
      courseCode: courseCode || 'EVENT',
      dayIndex,
      startTime,
      endTime,
      timeRange: `${startTime} – ${endTime}`,
      room: room || translate(language, 'timetable.defaultRoom'),
      lecturer: lecturer || translate(language, 'timetable.defaultLecturer'),
      color: type === 'practice' ? '#006E4B' : type === 'exam' ? '#BA1A1A' : '#0058BE',
      bgColor: type === 'practice' ? '#D7E8CD' : type === 'exam' ? '#FFDAD6' : '#D8E2FF',
      textColor: type === 'practice' ? '#002113' : type === 'exam' ? '#93000A' : '#001A42',
      type,
      typeLabel: typeLabelMap[type],
    });

    setSubjectName('');
    setCourseCode('');
    setRoom('');
    setLecturer('');
    setStartTime('09:00');
    setEndTime('10:30');
    onClose();
  };

  React.useEffect(() => {
    if (!isOpen) setOpenSelect(null);
  }, [isOpen]);

  type SelectOption = {
    value: number;
    label: string;
  };

  const FormSelect = ({
    id,
    label,
    value,
    options,
    onChange,
  }: {
    id: string;
    label: string;
    value: number;
    options: SelectOption[];
    onChange: (value: number) => void;
  }) => {
    const selected = options.find((option) => option.value === value) || options[0];
    const isOpenSelect = openSelect === id;

    return (
      <div className="relative flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#131B2E]">{label}</label>
        <button
          type="button"
          onClick={() => setOpenSelect(isOpenSelect ? null : id)}
          className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left text-sm font-semibold text-[#131B2E] shadow-sm transition-all ${
            isOpenSelect
              ? 'border-[#4F46E5] ring-4 ring-[#4F46E5]/10'
              : 'border-[#E2E8F0] hover:border-[#C7D2FE]'
          }`}
        >
          <span>{selected.label}</span>
          <ChevronDown className={`h-4 w-4 text-[#64748B] transition-transform ${isOpenSelect ? 'rotate-180' : ''}`} />
        </button>

        {isOpenSelect && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-56 overflow-y-auto overscroll-contain rounded-2xl border border-[#C7D2FE] bg-white p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.16)] [scrollbar-color:#A5B4FC_transparent] [scrollbar-width:thin]">
            {options.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpenSelect(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[#EEF2FF] text-[#4F46E5]'
                      : 'text-[#334155] hover:bg-[#F8FAFC] hover:text-[#4F46E5]'
                  }`}
                >
                  <span>{option.label}</span>
                  {active && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const classTypes: { id: 'theory' | 'practice' | 'exam'; labelKey: TranslationKey }[] = [
    { id: 'theory', labelKey: 'timetable.type.theory' },
    { id: 'practice', labelKey: 'timetable.type.practice' },
    { id: 'exam', labelKey: 'timetable.type.exam' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={translate(language, 'timetable.addModalTitle')}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.45fr_0.85fr]">
          <Input
            label={`${translate(language, 'timetable.field.name')} *`}
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder={translate(language, 'timetable.field.namePlaceholder')}
            leftIcon={<BookOpen className="w-4 h-4" />}
            className="h-12 rounded-xl"
            required
          />
          <Input
            label={translate(language, 'timetable.field.code')}
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            placeholder={translate(language, 'timetable.field.codePlaceholder')}
            className="h-12 rounded-xl"
          />
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]/70 p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormSelect
              id="day"
              label={translate(language, 'timetable.field.weekday')}
              value={dayIndex}
              onChange={setDayIndex}
              options={WEEKDAY_KEYS.map((key, value) => ({
                value,
                label: translate(language, key),
              }))}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#131B2E]">{translate(language, 'timetable.field.startTime')}</label>
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (endTime <= e.target.value) {
                      setEndTime(defaultEndTime(e.target.value, 60));
                    }
                  }}
                  className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-3 text-sm font-semibold text-[#131B2E] shadow-sm outline-none transition focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#131B2E]">{translate(language, 'timetable.field.endTime')}</label>
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="time"
                  value={endTime}
                  min={startTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-3 text-sm font-semibold text-[#131B2E] shadow-sm outline-none transition focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                  required
                />
              </div>
            </div>
          </div>
          {timeError && <p className="mt-2 text-xs font-semibold text-[#BA1A1A]">{timeError}</p>}
          <p className="mt-2 text-[11px] leading-relaxed text-[#64748B]">{translate(language, 'timetable.timeHint')}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label={translate(language, 'timetable.field.location')}
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder={translate(language, 'timetable.field.locationPlaceholder')}
            leftIcon={<MapPin className="w-4 h-4" />}
            className="h-12 rounded-xl"
          />
          <Input
            label={translate(language, 'timetable.field.instructor')}
            value={lecturer}
            onChange={(e) => setLecturer(e.target.value)}
            placeholder={translate(language, 'timetable.field.instructorPlaceholder')}
            leftIcon={<User className="w-4 h-4" />}
            className="h-12 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#131B2E]">{translate(language, 'timetable.field.type')}</label>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-1.5">
            {classTypes.map((t) => (
              <label
                key={t.id}
                className={`flex h-10 cursor-pointer items-center justify-center rounded-xl px-3 text-sm font-bold transition-all ${
                  type === t.id
                    ? 'bg-[#4F46E5] text-white shadow-md shadow-[#4F46E5]/20'
                    : 'text-[#64748B] hover:bg-white hover:text-[#4F46E5]'
                }`}
              >
                <input
                  type="radio"
                  name="classType"
                  value={t.id}
                  checked={type === t.id}
                  onChange={() => setType(t.id)}
                  className="hidden"
                />
                <span>{translate(language, t.labelKey)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-1 flex items-center justify-end gap-2 border-t border-[#E2E8F0] pt-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            {translate(language, 'timetable.cancel')}
          </Button>
          <Button type="submit" variant="primary">
            <BookmarkPlus className="w-4 h-4" />
            <span>{translate(language, 'timetable.addSubject')}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
