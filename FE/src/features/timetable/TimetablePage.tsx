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
import { formatTimeRangeLabel, parseTimeToMinutes } from './utils/timetableTime';

export const TimetablePage: React.FC = () => {
  const language = useCurrentLanguage();
  const [selectedClass, setSelectedClass] = useState<TimetableClassItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [quickAddPosition, setQuickAddPosition] = useState<{ dayIndex: number; startTime: string } | null>(null);

  const { data: weeklyData, isLoading, isError } = useWeeklyTimetable();
  const createItemMutation = useCreateTimetableItem();
  const deleteItemMutation = useDeleteTimetableItem();
  const createTimetableMutation = useCreateTimetable();

  const timetable = weeklyData?.timetable;
  const rawItems = weeklyData?.items || [];

  const convertedClasses: TimetableClassItem[] = rawItems.map((item) => {
    const startTime = (item.startTime || '09:00').slice(0, 5);
    const endTime = (item.endTime || '10:30').slice(0, 5);

    const typeLower = (item.type || 'THEORY').toLowerCase() as 'theory' | 'practice' | 'exam';
    const typeLabel =
      typeLower === 'practice'
        ? translate(language, 'timetable.type.practice')
        : typeLower === 'exam'
        ? translate(language, 'timetable.type.exam')
        : translate(language, 'timetable.type.theory');

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
      startTime,
      endTime,
      timeRange: formatTimeRangeLabel(startTime, endTime),
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

  const handleAddClass = (newCls: Omit<TimetableClassItem, 'id'>) => {
    const payload = {
      subjectName: newCls.subjectName,
      courseCode: newCls.courseCode,
      dayOfWeek: newCls.dayIndex ?? 0,
      startTime: newCls.startTime,
      endTime: newCls.endTime,
      room: newCls.room,
      lecturer: newCls.lecturer,
      classType: (newCls.type?.toUpperCase() || 'THEORY') as 'THEORY' | 'PRACTICE' | 'EXAM',
    };

    if (timetable?.id) {
      createItemMutation.mutate({ timetableId: timetable.id, data: payload }, {
        onSuccess: () => setIsAddOpen(false),
      });
    } else {
      createTimetableMutation.mutate(
        { name: 'Học kỳ 1', termName: 'Học kỳ 1', academicYear: '2026-2027', isCurrent: true },
        {
          onSuccess: (newTt) => {
            createItemMutation.mutate({ timetableId: newTt.id, data: payload }, {
              onSuccess: () => setIsAddOpen(false),
            });
          },
        }
      );
    }
  };

  const handleQuickAdd = (dayIndex: number, startTime: string) => {
    setQuickAddPosition({ dayIndex, startTime });
    setIsAddOpen(true);
  };

  const semesterInfo = {
    termName: timetable?.termName || `${translate(language, 'timetable.semester')} I`,
    academicYear: timetable?.academicYear || '2026 - 2027',
    totalSubjects: timetable?.totalSubjects ?? convertedClasses.length,
    totalCredits: convertedClasses.reduce((sum, c) => {
      const durationHours = (parseTimeToMinutes(c.endTime) - parseTimeToMinutes(c.startTime)) / 60;
      return sum + Math.max(1, Math.round(durationHours));
    }, 0),
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
          <span className="ml-2 text-xs font-semibold text-[#64748B]">{translate(language, 'timetable.loading')}</span>
        </div>
      ) : isError ? (
        <div className="p-4 bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl text-xs text-[#BA1A1A]">
          {translate(language, 'timetable.error')}
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
        initialStartTime={quickAddPosition?.startTime}
      />
    </div>
  );
};
