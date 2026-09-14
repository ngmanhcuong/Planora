import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookOpen, MapPin, User, BookmarkPlus } from 'lucide-react';
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm môn học mới vào TKB"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Tên môn học *"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="VD: Kiểm thử phần mềm"
            leftIcon={<BookOpen className="w-4 h-4" />}
            required
          />
          <Input
            label="Mã môn học"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            placeholder="VD: IT4010"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#131B2E]">Thứ trong tuần</label>
            <select
              value={dayIndex}
              onChange={(e) => setDayIndex(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#131B2E] focus:outline-none focus:border-[#4F46E5]"
            >
              <option value={0}>Thứ Hai</option>
              <option value={1}>Thứ Ba</option>
              <option value={2}>Thứ Tư</option>
              <option value={3}>Thứ Năm</option>
              <option value={4}>Thứ Sáu</option>
              <option value={5}>Thứ Bảy</option>
              <option value={6}>Chủ Nhật</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#131B2E]">Tiết bắt đầu</label>
            <select
              value={startSlot}
              onChange={(e) => setStartSlot(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#131B2E] focus:outline-none focus:border-[#4F46E5]"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((slot) => (
                <option key={slot} value={slot}>
                  Tiết {slot}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#131B2E]">Số tiết (Độ dài)</label>
            <select
              value={slotSpan}
              onChange={(e) => setSlotSpan(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#131B2E] focus:outline-none focus:border-[#4F46E5]"
            >
              <option value={1}>1 tiết</option>
              <option value={2}>2 tiết</option>
              <option value={3}>3 tiết</option>
              <option value={4}>4 tiết</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Phòng học"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="VD: Phòng A2-304 / Lab 02"
            leftIcon={<MapPin className="w-4 h-4" />}
          />
          <Input
            label="Giảng viên"
            value={lecturer}
            onChange={(e) => setLecturer(e.target.value)}
            placeholder="VD: TS. Nguyễn Văn A"
            leftIcon={<User className="w-4 h-4" />}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#131B2E]">Loại hình lớp học</label>
          <div className="flex items-center gap-3">
            {[
              { id: 'theory', label: 'Lý thuyết' },
              { id: 'practice', label: 'Thực hành' },
              { id: 'exam', label: 'Thi / Kiểm tra' },
            ].map((t) => (
              <label
                key={t.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                  type === t.id
                    ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#EEF2FF]'
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
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] mt-2">
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
