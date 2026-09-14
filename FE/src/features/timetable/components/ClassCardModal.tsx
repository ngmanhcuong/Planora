import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MapPin, User, Clock, Calendar, FileText, Trash2, Edit3 } from 'lucide-react';
import type { TimetableClassItem } from '../types';

export interface ClassCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: TimetableClassItem | null;
  onDeleteClass?: (id: string) => void;
}

export const ClassCardModal: React.FC<ClassCardModalProps> = ({
  isOpen,
  onClose,
  selectedClass,
  onDeleteClass,
}) => {
  if (!selectedClass) return null;

  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết môn học"
      maxWidth="md"
    >
      <div className="flex flex-col gap-4">
        {/* Class Header Banner */}
        <div
          className="p-4 rounded-xl flex flex-col gap-2 border border-black/10"
          style={{
            backgroundColor: selectedClass.bgColor,
            color: selectedClass.textColor,
            borderLeft: `6px solid ${selectedClass.color}`,
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <Badge customBg="#FFFFFF" customColor={selectedClass.color} size="sm">
              {selectedClass.typeLabel}
            </Badge>
            <span className="text-xs font-mono font-bold tracking-wider opacity-80">
              {selectedClass.courseCode}
            </span>
          </div>

          <h3 className="text-lg font-bold font-heading">{selectedClass.subjectName}</h3>
        </div>

        {/* Detailed Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#131B2E]">
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <Calendar className="w-4 h-4 text-[#4F46E5] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] text-[#64748B] font-semibold">Thứ trong tuần</span>
              <span className="font-bold">{dayNames[selectedClass.dayIndex]}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <Clock className="w-4 h-4 text-[#4F46E5] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] text-[#64748B] font-semibold">Khung giờ tiết học</span>
              <span className="font-bold">{selectedClass.timeRange}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <MapPin className="w-4 h-4 text-[#006E4B] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] text-[#64748B] font-semibold">Phòng học / Địa điểm</span>
              <span className="font-bold">{selectedClass.room}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <User className="w-4 h-4 text-[#0058BE] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] text-[#64748B] font-semibold">Giảng viên phụ trách</span>
              <span className="font-bold">{selectedClass.lecturer}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {selectedClass.notes && (
          <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] text-xs">
            <span className="flex items-center gap-1.5 font-bold text-[#3323CC]">
              <FileText className="w-3.5 h-3.5" />
              Ghi chú môn học:
            </span>
            <p className="text-[#131B2E] leading-relaxed">{selectedClass.notes}</p>
          </div>
        )}
        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between w-full pt-4 border-t border-[#E2E8F0] mt-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onDeleteClass?.(selectedClass.id);
              onClose();
            }}
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa môn này</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Đóng
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              <Edit3 className="w-4 h-4" />
              <span>Chỉnh sửa</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
