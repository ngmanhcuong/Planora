import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookOpen, MapPin, User, BookmarkPlus, ChevronDown } from 'lucide-react';
import type { TimetableClassItem } from '../types';

export interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClass: (cls: Omit<TimetableClassItem, 'id'>) => void;
}

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onAddClass,
}) => {
  const [subjectName, setSubjectName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [dayIndex, setDayIndex] = useState<number>(0);
  const [startSlot, setStartSlot] = useState<number>(1);
  const [slotSpan, setSlotSpan] = useState<number>(3);
  const [room, setRoom] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [type, setType] = useState<'theory' | 'practice' | 'exam'>('theory');

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

  const selectBaseClass =
    'h-12 w-full appearance-none rounded-xl border border-[#E2E8F0] bg-white px-4 pr-10 text-sm font-semibold text-[#131B2E] shadow-sm transition-all focus:border-[#4F46E5] focus:outline-none focus:ring-4 focus:ring-[#4F46E5]/10';

  const SelectChevron = () => (
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
  );

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
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#131B2E]">Thứ trong tuần</label>
              <div className="relative">
                <select
                  value={dayIndex}
                  onChange={(e) => setDayIndex(Number(e.target.value))}
                  className={selectBaseClass}
                >
                  <option value={0}>Thứ Hai</option>
                  <option value={1}>Thứ Ba</option>
                  <option value={2}>Thứ Tư</option>
                  <option value={3}>Thứ Năm</option>
                  <option value={4}>Thứ Sáu</option>
                  <option value={5}>Thứ Bảy</option>
                  <option value={6}>Chủ Nhật</option>
                </select>
                <SelectChevron />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#131B2E]">Tiết bắt đầu</label>
              <div className="relative">
                <select
                  value={startSlot}
                  onChange={(e) => setStartSlot(Number(e.target.value))}
                  className={selectBaseClass}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((slot) => (
                    <option key={slot} value={slot}>
                      Tiết {slot}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#131B2E]">Số tiết</label>
              <div className="relative">
                <select
                  value={slotSpan}
                  onChange={(e) => setSlotSpan(Number(e.target.value))}
                  className={selectBaseClass}
                >
                  <option value={1}>1 tiết</option>
                  <option value={2}>2 tiết</option>
                  <option value={3}>3 tiết</option>
                  <option value={4}>4 tiết</option>
                </select>
                <SelectChevron />
              </div>
            </div>
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
