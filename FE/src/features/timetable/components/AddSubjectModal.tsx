import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookOpen, MapPin, User, BookmarkPlus, ChevronDown, Check } from 'lucide-react';
import type { TimetableClassItem } from '../types';

export interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClass: (cls: Omit<TimetableClassItem, 'id'>) => void;
  initialDayIndex?: number;
  initialStartSlot?: number;
}

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onAddClass,
  initialDayIndex,
  initialStartSlot,
}) => {
  const [subjectName, setSubjectName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [dayIndex, setDayIndex] = useState<number>(0);
  const [startSlot, setStartSlot] = useState<number>(1);
  const [slotSpan, setSlotSpan] = useState<number>(3);
  const [room, setRoom] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [type, setType] = useState<'theory' | 'practice' | 'exam'>('theory');
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    if (typeof initialDayIndex === 'number') setDayIndex(initialDayIndex);
    if (typeof initialStartSlot === 'number') setStartSlot(initialStartSlot);
  }, [isOpen, initialDayIndex, initialStartSlot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    const typeLabelMap = {
      theory: 'Lý thuyết',
      practice: 'Thực hành',
      exam: 'Thi / Kiểm tra',
    };

    const endSlot = startSlot + slotSpan - 1;

    onAddClass({
      subjectName,
      courseCode: courseCode || 'IT-SUBJ',
      dayIndex,
      startSlot,
      slotSpan,
      timeRange: `Tiết ${startSlot} - ${endSlot}`,
      room: room || 'Phòng học chưa xếp',
      lecturer: lecturer || 'Chưa cập nhật',
      color: type === 'practice' ? '#006E4B' : type === 'exam' ? '#BA1A1A' : '#0058BE',
      bgColor: type === 'practice' ? '#D7E8CD' : type === 'exam' ? '#FFDAD6' : '#D8E2FF',
      textColor: type === 'practice' ? '#002113' : type === 'exam' ? '#93000A' : '#001A42',
      type,
      typeLabel: typeLabelMap[type],
    });

    // Reset
    setSubjectName('');
    setCourseCode('');
    setRoom('');
    setLecturer('');
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm môn học mới vào TKB"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.45fr_0.85fr]">
          <Input
            label="Tên môn học *"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="VD: Kiểm thử phần mềm"
            leftIcon={<BookOpen className="w-4 h-4" />}
            className="h-12 rounded-xl"
            required
          />
          <Input
            label="Mã môn học"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            placeholder="VD: IT4010"
            className="h-12 rounded-xl"
          />
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]/70 p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormSelect
              id="day"
              label="Thứ trong tuần"
              value={dayIndex}
              onChange={setDayIndex}
              options={[
                { value: 0, label: 'Thứ Hai' },
                { value: 1, label: 'Thứ Ba' },
                { value: 2, label: 'Thứ Tư' },
                { value: 3, label: 'Thứ Năm' },
                { value: 4, label: 'Thứ Sáu' },
                { value: 5, label: 'Thứ Bảy' },
                { value: 6, label: 'Chủ Nhật' },
              ]}
            />

            <FormSelect
              id="startSlot"
              label="Tiết bắt đầu"
              value={startSlot}
              onChange={setStartSlot}
              options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((slot) => ({ value: slot, label: `Tiết ${slot}` }))}
            />

            <FormSelect
              id="slotSpan"
              label="Số tiết"
              value={slotSpan}
              onChange={setSlotSpan}
              options={[
                { value: 1, label: '1 tiết' },
                { value: 2, label: '2 tiết' },
                { value: 3, label: '3 tiết' },
                { value: 4, label: '4 tiết' },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Phòng học"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="VD: Phòng A2-304 / Lab 02"
            leftIcon={<MapPin className="w-4 h-4" />}
            className="h-12 rounded-xl"
          />
          <Input
            label="Giảng viên"
            value={lecturer}
            onChange={(e) => setLecturer(e.target.value)}
            placeholder="VD: TS. Nguyễn Văn A"
            leftIcon={<User className="w-4 h-4" />}
            className="h-12 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#131B2E]">Loại hình lớp học</label>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-1.5">
            {[
              { id: 'theory', label: 'Lý thuyết' },
              { id: 'practice', label: 'Thực hành' },
              { id: 'exam', label: 'Thi / Kiểm tra' },
            ].map((t) => (
              <label
                key={t.id}
                className={`flex h-10 items-center justify-center rounded-xl px-3 text-sm font-bold cursor-pointer transition-all ${
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
                  onChange={() => setType(t.id as any)}
                  className="hidden"
                />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] mt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary">
            <BookmarkPlus className="w-4 h-4" />
            <span>Thêm môn học</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
