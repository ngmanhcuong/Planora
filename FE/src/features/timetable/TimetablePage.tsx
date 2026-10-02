import React, { useMemo, useState } from 'react';
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
import { minutesToTimeString, TIMETABLE_GRID_END, rangesOverlap } from './utils/timetableTime';
import { useUpdateTimetableItem } from './hooks/useTimetable';
import { useCalendarRange } from '@/features/calendar/hooks/useCalendar';

export const TimetablePage: React.FC = () => {
  const language = useCurrentLanguage();
  const moveMutation = useUpdateTimetableItem();
  const [moveError, setMoveError] = useState('');
  const [editingClass, setEditingClass] = useState<TimetableClassItem | null>(null);
  const editMutation = useUpdateTimetableItem();
  const [selectedClass, setSelectedClass] = useState<TimetableClassItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [quickAddPosition, setQuickAddPosition] = useState<{ dayIndex: number; startTime: string } | null>(null);

  const { data: weeklyData, isLoading, isError } = useWeeklyTimetable();
  const weekRange = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start: start.toISOString(), end: end.toISOString() };
  }, []);
  const { data: calendarItems = [], isLoading: isCalendarLoading, isError: isCalendarError } = useCalendarRange(weekRange);
  const createItemMutation = useCreateTimetableItem();
  const deleteItemMutation = useDeleteTimetableItem();
  const createTimetableMutation = useCreateTimetable();

  const timetable = weeklyData?.timetable;
  const rawItems = weeklyData?.items || [];

  const timetableClasses: TimetableClassItem[] = rawItems.map((item) => {
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
      lecturer: item.lecturer || 'Chưa có thông tin',
      notes: item.notes || undefined,
      color: colorScheme.color,
      bgColor: colorScheme.bgColor,
      textColor: colorScheme.textColor,
      type: typeLower,
      typeLabel,
      sourceType: 'TIMETABLE',
    };
  });

  const calendarClasses: TimetableClassItem[] = calendarItems
    .filter((item) => item.sourceType !== 'TIMETABLE')
    .map((item) => {
      const start = new Date(item.start);
      const parsedEnd = item.end ? new Date(item.end) : new Date(start.getTime() + 60 * 60_000);
      const end = parsedEnd > start ? parsedEnd : new Date(start.getTime() + 60 * 60_000);
      const startTime = item.allDay ? '07:00' : start.toTimeString().slice(0, 5);
      const endTime = item.allDay ? '08:00' : end.toTimeString().slice(0, 5);
      const isTask = item.sourceType === 'TASK';
      return {
        id: `${item.sourceType.toLowerCase()}_${item.id}_${start.toISOString()}`,
        subjectName: item.title,
        courseCode: item.courseCode || '',
        dayIndex: (start.getDay() + 6) % 7,
        startTime,
        endTime,
        timeRange: item.allDay ? 'Cả ngày' : formatTimeRangeLabel(startTime, endTime),
        room: item.location || item.room || 'Chưa xếp địa điểm',
        lecturer: item.lecturer || '',
        notes: item.description || undefined,
        color: item.category?.color || (isTask ? '#2563EB' : '#E11D48'),
        bgColor: item.category?.bgColor || (isTask ? '#DBEAFE' : '#FFE4E6'),
        textColor: item.category?.textColor || (isTask ? '#1E3A8A' : '#9F1239'),
        type: 'theory' as const,
        typeLabel: isTask ? 'Công việc' : 'Lịch riêng',
        sourceType: item.sourceType,
        readOnly: true,
      };
    });

  const convertedClasses = [...timetableClasses, ...calendarClasses];

  const handleSelectClass = (cls: TimetableClassItem) => {
    setSelectedClass(cls);
    setIsDetailOpen(true);
  };

  const handleMoveClass = (cls: TimetableClassItem, dayIndex: number, startTime: string) => {
    if (cls.readOnly || !timetable?.id || moveMutation.isPending) return;
    setMoveError('');
    if (cls.dayIndex === dayIndex && cls.startTime === startTime) return;
    const start = parseTimeToMinutes(startTime);
    const end = start + parseTimeToMinutes(cls.endTime) - parseTimeToMinutes(cls.startTime);
    if (end > TIMETABLE_GRID_END) {
      setMoveError('Khung giờ mới vượt quá 21:00. Vui lòng chọn ô sớm hơn.');
      return;
    }
    if (convertedClasses.some(item => item.id !== cls.id && item.dayIndex === dayIndex && rangesOverlap(start, end, parseTimeToMinutes(item.startTime), parseTimeToMinutes(item.endTime)))) {
      setMoveError('Khung giờ này trùng với lịch đã có. Vui lòng chọn ô khác.');
      return;
    }
    moveMutation.mutate({ timetableId: timetable.id, itemId: cls.id, data: { dayOfWeek: dayIndex, startTime, endTime: minutesToTimeString(end) } }, {
      onError: () => setMoveError('Không lưu được vị trí mới. Lịch vẫn ở vị trí cũ, vui lòng thử lại.'),
    });
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
        { name: 'Học kỳ 1', termName: 'Học kỳ 1', academicYear: '2026-2027', isCurrent: true, autoCreated: true },
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
    totalSubjects: convertedClasses.length,
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

        {moveError && <p role="alert" className="text-sm text-rose-500">{moveError}</p>}
        <span role="status" className="sr-only">{moveMutation.isPending ? 'Đang lưu vị trí lịch…' : ''}</span>
        {isLoading || isCalendarLoading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#4F46E5]" />
          <span className="ml-2 text-xs font-semibold text-[#64748B]">{translate(language, 'timetable.loading')}</span>
        </div>
      ) : isError || isCalendarError ? (
        <div className="p-4 bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl text-xs text-[#BA1A1A]">
          {translate(language, 'timetable.error')}
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <TimetableGrid
            classes={convertedClasses}
            onSelectClass={handleSelectClass}
            onMoveClass={handleMoveClass}
            isMoving={moveMutation.isPending}
            onQuickAdd={handleQuickAdd}
          />
        </div>
      )}

      <ClassCardModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        selectedClass={selectedClass}
        onDeleteClass={selectedClass?.readOnly ? undefined : handleDeleteClass}
        onEditClass={selectedClass?.readOnly ? undefined : (cls) => { setIsDetailOpen(false); setEditingClass(cls); }}
      />

      <AddSubjectModal
        isOpen={editingClass !== null}
        editingClass={editingClass}
        onClose={() => setEditingClass(null)}
        onAddClass={async (updated) => {
          if (!editingClass || !timetable?.id) throw new Error('Không tìm thấy lịch');
          await editMutation.mutateAsync({
            timetableId: timetable.id,
            itemId: editingClass.id,
            data: {
              subjectName: updated.subjectName.trim(), courseCode: updated.courseCode,
              dayOfWeek: updated.dayIndex, startTime: updated.startTime, endTime: updated.endTime,
              room: updated.room, lecturer: updated.lecturer,
              classType: updated.type.toUpperCase() as 'THEORY' | 'PRACTICE' | 'EXAM',
            },
          });
          setSelectedClass({ ...editingClass, ...updated });
        }}
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
