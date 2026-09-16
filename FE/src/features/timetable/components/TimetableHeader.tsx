import React from 'react';
import { PlusCircle, Printer, Download, BookOpen, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { TermSemesterInfo } from '../types';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';

export interface TimetableHeaderProps {
  semesterInfo: TermSemesterInfo;
  onOpenAddModal: () => void;
}

export const TimetableHeader: React.FC<TimetableHeaderProps> = ({
  semesterInfo,
  onOpenAddModal,
}) => {
  const language = useCurrentLanguage();

  return (
    <div className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Title & Semester Selector */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#131B2E] tracking-tight font-heading">
              {translate(language, 'timetable.title')}
            </h1>
            <Badge customBg="#D8E2FF" customColor="#001A42" size="md">
              {semesterInfo.termName} ({semesterInfo.academicYear})
            </Badge>
          </div>

          <div className="flex items-center gap-3 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#64748B]">
            <span className="flex items-center gap-1.5 text-[#131B2E]">
              <BookOpen className="w-3.5 h-3.5 text-[#4F46E5]" />
              {semesterInfo.totalSubjects} {translate(language, 'timetable.subjects')}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
            <span className="flex items-center gap-1.5 text-[#131B2E]">
              <Award className="w-3.5 h-3.5 text-[#006E4B]" />
              {semesterInfo.totalCredits} {translate(language, 'timetable.credits')}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            className="bg-[#F8FAFC] border-[#E2E8F0]"
          >
            <Printer className="w-4 h-4 text-[#64748B]" />
            <span className="hidden sm:inline">{translate(language, 'timetable.print')}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="bg-[#F8FAFC] border-[#E2E8F0]"
          >
            <Download className="w-4 h-4 text-[#64748B]" />
            <span className="hidden sm:inline">{translate(language, 'timetable.export')}</span>
          </Button>

          <Button variant="primary" size="sm" onClick={onOpenAddModal}>
            <PlusCircle className="w-4 h-4" />
            <span>{translate(language, 'timetable.addSubject')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
