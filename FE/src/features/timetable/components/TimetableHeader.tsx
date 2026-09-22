import React from 'react';
import { PlusCircle, Printer, Download, BookOpen, Award, Calendar } from 'lucide-react';
import type { TermSemesterInfo } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';
import { UserHeroBanner } from '@/components/ui/UserHeroBanner';

export interface TimetableHeaderProps {
  semesterInfo: TermSemesterInfo;
  onOpenAddModal: () => void;
}

export const TimetableHeader: React.FC<TimetableHeaderProps> = ({
  semesterInfo,
  onOpenAddModal,
}) => {
  const language = useCurrentLanguage();
  const localizedTermName = semesterInfo.termName.replace(/^Học kỳ\s*/i, `${translate(language, 'timetable.semester')} `);

  return (
    <UserHeroBanner
      tone="timetable"
      icon={Calendar}
      iconClassName="text-emerald-100"
      badge={`${localizedTermName} (${semesterInfo.academicYear})`}
      badges={(
        <>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-md">
                <BookOpen className="h-4 w-4 text-indigo-200" />
                {semesterInfo.totalSubjects} {translate(language, 'timetable.subjects')}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-md">
                <Award className="h-4 w-4 text-emerald-300" />
                {semesterInfo.totalCredits} {translate(language, 'timetable.credits')}
              </span>
        </>
      )}
      title={translate(language, 'timetable.title')}
      subtitle={translate(language, 'timetable.subtitle')}
      actions={(
        <>
          <button
            onClick={() => window.print()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white/85 shadow-sm backdrop-blur-md transition hover:bg-white/18"
          >
            <Printer className="h-4 w-4 text-indigo-200" />
            <span>{translate(language, 'timetable.print')}</span>
          </button>

          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white/85 shadow-sm backdrop-blur-md transition hover:bg-white/18"
          >
            <Download className="h-4 w-4 text-indigo-200" />
            <span>{translate(language, 'timetable.export')}</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{translate(language, 'timetable.addSubject')}</span>
          </button>
        </>
      )}
    />
  );
};
