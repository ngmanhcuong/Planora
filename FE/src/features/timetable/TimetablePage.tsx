import React, { useState } from 'react';
import { TimetableHeader } from './components/TimetableHeader';
import { TimetableGrid } from './components/TimetableGrid';
import { ClassCardModal } from './components/ClassCardModal';
import { AddSubjectModal } from './components/AddSubjectModal';
import { useWeeklyTimetable, useCreateTimetableItem, useDeleteTimetableItem, useCreateTimetable } from './hooks/useTimetable';
import type { TimetableClassItem } from './types';
import { Loader2 } from 'lucide-react';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';

export const TimetablePage: React.FC = () => {
  const language = useCurrentLanguage();
  const [selectedClass, setSelectedClass] = useState<TimetableClassItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [quickAddPosition, setQuickAddPosition] = useState<{ dayIndex: number; startSlot: number } | null>(null);

  const { data: weeklyData, isLoading, isError } = useWeeklyTimetable();
  const createItemMutation = useCreateTimetableItem();
  const deleteItemMutation = useDeleteTimetableItem();
  const createTimetableMutation = useCreateTimetable();

  const timetable = weeklyData?.timetable;
  const rawItems = weeklyData?.items || [];

  const convertedClasses: TimetableClassItem[] = rawItems.map((item) => {
    const startHour = parseInt((item.startTime || '07:30').split(':')[0], 10);
    const endHour = parseInt((item.endTime || '09:30').split(':')[0], 10);
    const startSlot = Math.max(1, Math.min(10, startHour - 6));
    const slotSpan = Math.max(1, Math.min(6, endHour - startHour));

    const typeLower = (item.type || 'THEORY').toLowerCase() as 'theory' | 'practice' | 'exam';
    const typeLabel = typeLower === 'practice' ? 'Thực hành' : typeLower === 'exam' ? 'Thi / Kiểm tra' : 'Lý thuyết';

    const colorScheme =
      typeLower === 'practice'
        ? { color: '#0D9488', bgColor: '#CCFBF1', textColor: '#115E59' }
        : typeLower === 'exam'
        ? { color: '#E11D48', bgColor: '#FFE4E6', textColor: '#9F1239' }
        : { color: '#4F46E5', bgColor: '#EEF2FF', textColor: '#3730A3' };

    return {
      id: item.id,
      subjectName: item.subjectName || 'Môn học',
      courseCode: item.courseCode || '',
      dayIndex: item.dayOfWeek,
      timeRange: `${item.startTime || '07:30'} – ${item.endTime || '09:30'}`,
      startSlot,
      slotSpan,
      room: item.room || 'Chưa xếp phòng',
      lecturer: item.lecturer || 'Giảng viên',
      color: colorScheme.color,
      bgColor: colorScheme.bgColor,
      textColor: colorScheme.textColor,
      type: typeLower,
      typeLabel,
    };
  });

  const handleSelectClass = (cls: TimetableClassItem) => {
    setSelectedClass(cls);
    setIsDetailOpen(true);
  };

  const handleDeleteClass = (id: string) => {
    if (timetable?.id) {
      deleteItemMutation.mutate({ timetableId: timetable.id, itemId: id });
    }
    setIsDetailOpen(false);
  };

  const handleAddClass = (newCls: any) => {
    const startHour = 7 + (newCls.startSlot - 1);
    const endHour = startHour + (newCls.slotSpan || 2);
    const startTime = `${String(startHour).padStart(2, '0')}:00`;
    const endTime = `${String(endHour).padStart(2, '0')}:00`;

    const payload = {
      subjectName: newCls.subjectName,
      courseCode: newCls.courseCode,
      dayOfWeek: newCls.dayIndex ?? 0,
      startTime,
      endTime,
      room: newCls.room,
      lecturer: newCls.lecturer,
      classType: (newCls.type?.toUpperCase() || 'THEORY') as 'THEORY' | 'PRACTICE' | 'EXAM',
    };

    if (timetable?.id) {
      createItemMutation.mutate({ timetableId: timetable.id, data: payload }, {
        onSuccess: () => setIsAddOpen(false)
      });
    } else {
      // Create a default timetable first if none exists
      createTimetableMutation.mutate(
        { name: 'Học kỳ 1', termName: 'Học kỳ 1', academicYear: '2026-2027', isCurrent: true },
        {
          onSuccess: (newTt) => {
            createItemMutation.mutate({ timetableId: newTt.id, data: payload }, {
              onSuccess: () => setIsAddOpen(false)
            });
          },
        }
      );
    }
  };

  const handleQuickAdd = (dayIndex: number, startSlot: number) => {
    setQuickAddPosition({ dayIndex, startSlot });
    setIsAddOpen(true);
  };

  const semesterInfo = {
    termName: timetable?.termName || `${translate(language, 'timetable.semester')} I`,
    academicYear: timetable?.academicYear || '2026 - 2027',
    totalSubjects: convertedClasses.length,
    totalCredits: convertedClasses.reduce((sum, c) => sum + (c.slotSpan >= 3 ? 3 : 2), 0),
  };

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      <TimetableHeader
        semesterInfo={semesterInfo}
        onOpenAddModal={() => {
          setQuickAddPosition(null);
          setIsAddOpen(true);
        }}
      />

      {isLoading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#4F46E5]" />
          <span className="ml-2 text-xs font-semibold text-[#64748B]">Đang tải thời khóa biểu...</span>
        </div>
      ) : isError ? (
        <div className="p-4 bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl text-xs text-[#BA1A1A]">
          Đã xảy ra lỗi khi tải thời khóa biểu. Vui lòng thử lại sau.
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <TimetableGrid
            classes={convertedClasses}
            onSelectClass={handleSelectClass}
            onQuickAdd={handleQuickAdd}
          />
        </div>
      )}

      <ClassCardModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        selectedClass={selectedClass}
        onDeleteClass={handleDeleteClass}
      />

      <AddSubjectModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddClass={handleAddClass}
        initialDayIndex={quickAddPosition?.dayIndex}
        initialStartSlot={quickAddPosition?.startSlot}
      />
    </div>
  );
};
